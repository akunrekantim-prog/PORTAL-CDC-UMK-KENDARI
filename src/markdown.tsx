import React from 'react';

/**
 * Render ringkas untuk isi konten berita/admin (format Medium-style):
 * - Baris "# " / "## " => heading
 * - "> " => quote
 * - "---" => garis pemisah
 * - "**tebal**" / "*miring*" => inline format
 * - baris lain => paragraf (whitespace dipertahankan)
 */
export function renderContentMarkdown(raw?: string): React.ReactNode {
  if (!raw) return null;
  const blocks: React.ReactNode[] = [];
  const lines = raw.split('\n');
  let i = 0;
  let key = 0;

  const inline = (text: string, k: number): React.ReactNode[] => {
    // Split by **bold** and *italic*
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let idx = 0;
    while ((m = regex.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      if (m[2] !== undefined) {
        parts.push(<strong key={`${k}-b-${idx}`}>{m[2]}</strong>);
      } else if (m[3] !== undefined) {
        parts.push(<em key={`${k}-i-${idx}`}>{m[3]}</em>);
      }
      last = m.index + m[0].length;
      idx++;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  };

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') {
      i++;
      continue;
    }
    if (line.trim() === '---') {
      blocks.push(<hr key={key++} className="border-slate-200 my-2" />);
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      blocks.push(
        <h2 key={key++} className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
          {inline(line.slice(2), key)}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push(
        <h3 key={key++} className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
          {inline(line.slice(3), key)}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith('> ')) {
      blocks.push(
        <blockquote key={key++} className="border-l-4 border-[#0077C6] pl-4 italic text-slate-600">
          {inline(line.slice(2), key)}
        </blockquote>
      );
      i++;
      continue;
    }
    // paragraf: gabungkan baris sampai baris kosong berikutnya
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].startsWith('# ') && !lines[i].startsWith('## ') && !lines[i].startsWith('> ') && lines[i].trim() !== '---') {
      para.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key++} className="text-slate-700 leading-relaxed">
        {inline(para.join(' '), key)}
      </p>
    );
  }
  return <>{blocks}</>;
}
