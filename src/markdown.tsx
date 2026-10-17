import React from 'react';
import DOMPurify from 'isomorphic-dompurify'; // Sanitizes HTML for security

/**
 * Membersihkan tag HTML & entity sehingga menghasilkan teks polos (plain text)
 * Sangat berguna untuk ringkasan/preview pada Card Layout (Program, Pengumuman, Berita, dll).
 */
export function stripHtmlTags(raw?: string): string {
  if (!raw) return '';

  // Ganti tag penutup paragraf/break dengan spasi agar kata tidak menempel
  const cleanMarkup = raw
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6])>/gi, ' ');

  let text = cleanMarkup;

  // Gunakan DOMParser jika tersedia di lingkungan browser
  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    try {
      const doc = new DOMParser().parseFromString(cleanMarkup, 'text/html');
      text = doc.body.textContent || doc.body.innerText || '';
    } catch {
      text = cleanMarkup.replace(/<[^>]*>/g, '');
    }
  } else {
    text = cleanMarkup.replace(/<[^>]*>/g, '');
  }

  // Bersihkan karakter entity HTML dan spasi berlebih
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sanitasi HTML terpadu untuk isi berita dan konten WYSIWYG
 * Memastikan semua tag format standar browser (b, i, u, strike, del, blockquote, dll.)
 * tetap dipertahankan dan aman dari XSS.
 */
export function sanitizeBeritaHtml(raw: string): string {
  if (!raw) return '';
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: [
      'p', 'br',
      'b', 'strong',
      'i', 'em',
      'u',
      's', 'strike', 'del',
      'sub', 'sup', 'mark', 'span',
      'a',
      'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote',
      'hr',
      'code', 'pre',
      'img', 'figure', 'figcaption',
      'div'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'style', 'id', 'type', 'start'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'link', 'meta'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'oninput', 'onsubmit'],
  });
}

function sanitizeHtml(raw: string): string {
  return sanitizeBeritaHtml(raw);
}

/**
 * Render ringkas untuk isi konten berita/admin/layanan (format Medium-style & GitHub Markdown):
 * - Baris "# " => Heading 1 / Title
 * - Baris "## " => Heading 2
 * - Baris "### " => Heading 3
 * - Baris "#### " => Heading 4
 * - "> " => blockquote
 * - "---" => garis pemisah
 * - "- " / "* " => unordered list bullet
 * - "1. " => ordered list number
 * - "**tebal**" / "*miring*" / "`code`" => inline format
 */
export function renderContentMarkdown(raw?: string): React.ReactNode {
  if (!raw) return null;
  // Jika isi sudah berupa HTML (berita yang diedit via WYSIWYG), sanitize ketat via DOMPurify
  if (/<[a-z][\s\S]*>/i.test(raw)) {
    const clean = sanitizeHtml(raw);
    return <div className="prose-berita" dangerouslySetInnerHTML={{ __html: clean }} />;
  }
  const blocks: React.ReactNode[] = [];
  const lines = raw.split('\n');
  let i = 0;
  let key = 0;

  const inline = (text: string, k: number): React.ReactNode[] => {
    // Split by **bold**, *italic*, and `code`
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let idx = 0;
    while ((m = regex.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      if (m[2] !== undefined) {
        parts.push(<strong key={`${k}-b-${idx}`} className="font-bold text-slate-900">{m[2]}</strong>);
      } else if (m[3] !== undefined) {
        parts.push(<em key={`${k}-i-${idx}`} className="italic">{m[3]}</em>);
      } else if (m[4] !== undefined) {
        parts.push(<code key={`${k}-c-${idx}`} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-mono">{m[4]}</code>);
      }
      last = m.index + m[0].length;
      idx++;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed === '') {
      i++;
      continue;
    }
    if (trimmed === '---') {
      blocks.push(<hr key={key++} className="border-slate-200 my-4" />);
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      blocks.push(
        <h2 key={key++} className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-4 mb-2 tracking-tight">
          {inline(line.slice(2), key)}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push(
        <h3 key={key++} className="text-xl sm:text-2xl font-bold text-slate-900 mt-4 mb-2 tracking-tight">
          {inline(line.slice(3), key)}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push(
        <h4 key={key++} className="text-lg sm:text-xl font-bold text-slate-900 mt-3 mb-1.5">
          {inline(line.slice(4), key)}
        </h4>
      );
      i++;
      continue;
    }
    if (line.startsWith('#### ')) {
      blocks.push(
        <h5 key={key++} className="text-base sm:text-lg font-bold text-slate-900 mt-3 mb-1">
          {inline(line.slice(5), key)}
        </h5>
      );
      i++;
      continue;
    }
    if (line.startsWith('> ')) {
      blocks.push(
        <blockquote key={key++} className="border-l-4 border-[#0077C6] pl-4 py-1 italic text-slate-600 bg-slate-50 rounded-r-lg my-2">
          {inline(line.slice(2), key)}
        </blockquote>
      );
      i++;
      continue;
    }

    // Unordered list (- or *)
    if (/^[-*]\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      blocks.push(
        <ul key={key++} className="list-disc list-inside space-y-1.5 text-slate-700 my-2 pl-2">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="leading-relaxed">
              {inline(item, key + lIdx)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list (1. , 2. )
    if (/^\d+\.\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push(
        <ol key={key++} className="list-decimal list-inside space-y-1.5 text-slate-700 my-2 pl-2">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="leading-relaxed">
              {inline(item, key + lIdx)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Paragraf: gabungkan baris sampai baris kosong atau heading berikutnya
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('# ') &&
      !lines[i].startsWith('## ') &&
      !lines[i].startsWith('### ') &&
      !lines[i].startsWith('#### ') &&
      !lines[i].startsWith('> ') &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      lines[i].trim() !== '---'
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key++} className="text-slate-700 leading-relaxed text-sm sm:text-base">
        {inline(para.join(' '), key)}
      </p>
    );
  }
  return <>{blocks}</>;
}
