/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Utility Share Media Sosial — Portal CDC UM Kendari
 * Fungsi pendukung pembentukan narasi postingan otomatis (caption)
 * dan penanganan berbagi ke platform Instagram, LinkedIn, WhatsApp, X, Telegram, Facebook.
 */

export interface ShareContentOptions {
  type?: 'prestasi' | 'berita' | 'event' | 'general';
  title: string;
  url?: string;
  namaMahasiswa?: string;
  prodi?: string;
  peringkat?: string;
  tahun?: string;
  scope?: string;
  author?: string;
  summary?: string;
}

/**
 * Membentuk teks narasi otomatis (caption) yang kaya informasi dan rapi
 * untuk dibagikan ke media sosial.
 */
export function generateShareCaption(options: ShareContentOptions): string {
  const targetUrl = options.url || (typeof window !== 'undefined' ? window.location.href : '');
  const title = options.title || 'Portal CDC UM Kendari';

  if (options.type === 'prestasi') {
    const mhsStr = options.namaMahasiswa ? `\n👤 Mahasiswa/Tim: ${options.namaMahasiswa}` : '';
    const prodiStr = options.prodi ? ` (${options.prodi})` : '';
    const rkStr = options.peringkat ? `\n🥇 Capaian: ${options.peringkat}` : '';
    const thnStr = options.tahun ? ` (${options.tahun})` : '';

    return (
      `🏆 [PRESTASI MAHASISWA UM KENDARI]\n\n` +
      `📌 ${title}${mhsStr}${prodiStr}${rkStr}${thnStr}\n\n` +
      `Simak rincian capaian prestasi selengkapnya di Portal CDC UM Kendari:\n` +
      `👉 ${targetUrl}`
    );
  }

  if (options.type === 'berita') {
    const scopeStr = options.scope ? ` [Tingkat ${options.scope.toUpperCase()}]` : '';
    const summaryStr = options.summary ? `\n\n"${options.summary}"` : '';

    return (
      `📰 [BERITA & ARTIKEL CDC UMK]${scopeStr}\n\n` +
      `📌 ${title}${summaryStr}\n\n` +
      `Baca selengkapnya di Portal CDC UM Kendari:\n` +
      `👉 ${targetUrl}`
    );
  }

  if (options.type === 'event') {
    const summaryStr = options.summary ? `\n\n${options.summary}` : '';

    return (
      `📅 [AGENDA & KEGIATAN CDC UMK]\n\n` +
      `📌 ${title}${summaryStr}\n\n` +
      `Informasi & pendaftaran selengkapnya di Portal CDC UM Kendari:\n` +
      `👉 ${targetUrl}`
    );
  }

  // Tipe General / Default
  return (
    `Portal CDC UM Kendari — ${title}\n\n` +
    `Informasi selengkapnya:\n` +
    `👉 ${targetUrl}`
  );
}

/**
 * Helper untuk menyalin teks narasi ke clipboard browser
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}



/**
 * Share ke LinkedIn
 * Menyalin narasi otomatis ke clipboard + membuka dialog posting LinkedIn
 */
export async function shareToLinkedIn(
  options: ShareContentOptions,
  onNotifyCopied?: (msg: string) => void
): Promise<void> {
  const targetUrl = options.url || (typeof window !== 'undefined' ? window.location.href : '');
  const caption = generateShareCaption({ ...options, url: targetUrl });

  // Salin narasi lengkap ke clipboard
  await copyToClipboard(caption);

  if (onNotifyCopied) {
    onNotifyCopied('Narasi postingan disalin! Siap ditempelkan pada postingan LinkedIn.');
  }

  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(targetUrl)}`;
  window.open(shareUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Share ke WhatsApp
 */
export function shareToWhatsApp(options: ShareContentOptions): void {
  const targetUrl = options.url || (typeof window !== 'undefined' ? window.location.href : '');
  const caption = generateShareCaption({ ...options, url: targetUrl });
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(caption)}`;
  window.open(waUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Share ke Twitter / X
 */
export function shareToTwitter(options: ShareContentOptions): void {
  const targetUrl = options.url || (typeof window !== 'undefined' ? window.location.href : '');
  const caption = generateShareCaption({ ...options, url: targetUrl });
  const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`;
  window.open(twUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Share ke Telegram
 */
export function shareToTelegram(options: ShareContentOptions): void {
  const targetUrl = options.url || (typeof window !== 'undefined' ? window.location.href : '');
  const caption = generateShareCaption({ ...options, url: targetUrl });
  const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(targetUrl)}&text=${encodeURIComponent(options.title)}`;
  window.open(tgUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Share ke Facebook
 */
export function shareToFacebook(options: ShareContentOptions): void {
  const targetUrl = options.url || (typeof window !== 'undefined' ? window.location.href : '');
  const caption = generateShareCaption({ ...options, url: targetUrl });
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(targetUrl)}&quote=${encodeURIComponent(caption)}`;
  window.open(fbUrl, '_blank', 'noopener,noreferrer');
}
