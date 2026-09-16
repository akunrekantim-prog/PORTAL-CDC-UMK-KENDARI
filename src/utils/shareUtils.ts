/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Utility Share Media Sosial — Portal CDC UM Kendari
 * Fungsi pendukung pembentukan narasi postingan otomatis (caption)
 * dinamis berbasis isi konten aktual untuk WhatsApp, X, Telegram, LinkedIn, Facebook.
 */

export interface ShareContentOptions {
  type?: 'prestasi' | 'berita' | 'event' | 'lowongan' | 'magang' | 'campus_hiring' | 'job_fair' | 'dokumen' | 'general';
  title: string;
  url?: string;
  namaInstansi?: string;
  lokasi?: string;
  gaji?: string;
  deadline?: string;
  kuota?: string;
  deskripsi?: string;
  kualifikasi?: string;
  tanggal?: string;
  kategori?: string;
  namaMahasiswa?: string;
  prodi?: string;
  peringkat?: string;
  tahun?: string;
  scope?: string;
  author?: string;
  summary?: string;
}

/**
 * Generates a clean URL-friendly slug string from any title
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * Membersihkan tag HTML dan pengulangan judul dari deskripsi/ringkasan
 */
export function stripHtmlTags(str?: string, titleToFilter?: string): string {
  if (!str) return '';
  let cleaned = str.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (titleToFilter && cleaned.toLowerCase().startsWith(titleToFilter.toLowerCase())) {
    cleaned = cleaned.slice(titleToFilter.length).replace(/^[:\s-]+/, '').trim();
  }
  return cleaned;
}

/**
 * Membentuk teks narasi otomatis (caption) dinamis yang kaya informasi,
 * mengekstrak dari isi konten aktual tanpa emoji berlebihan & tanpa tanda [ ].
 */
export function generateShareCaption(options: ShareContentOptions): string {
  const targetUrl = options.url || (typeof window !== 'undefined' ? window.location.href : '');
  const title = options.title || 'Portal CDC UM Kendari';

  if (options.type === 'lowongan') {
    const instansiStr = options.namaInstansi ? `\nPerusahaan: ${options.namaInstansi}` : '';
    const lokasiStr = options.lokasi ? `\nLokasi: ${options.lokasi}` : '';
    const gajiStr = options.gaji ? `\nKompensasi: ${options.gaji}` : '';
    const deadlineStr = options.deadline ? `\nBatas Waktu: ${options.deadline}` : '';
    const descRaw = stripHtmlTags(options.summary || options.deskripsi || options.kualifikasi, title);
    const descStr = descRaw ? `\n\nRingkasan Pekerjaan:\n"${descRaw.slice(0, 180).replace(/\.*$/, '')}..."` : '';

    return (
      `LOWONGAN KERJA RESMI MITRA CDC UMK\n\n` +
      `${title}${instansiStr}${lokasiStr}${gajiStr}${deadlineStr}${descStr}\n\n` +
      `Simak kualifikasi lengkap & kirimkan lamaran pekerjaan langsung via Portal CDC UM Kendari:\n` +
      `👉 ${targetUrl}\n\n` +
      `#LowonganKerja #InfoKarir #CDCUMKendari #UMKendari`
    );
  }

  if (options.type === 'magang') {
    const instansiStr = options.namaInstansi ? `\nInstansi: ${options.namaInstansi}` : '';
    const lokasiStr = options.lokasi ? `\nLokasi: ${options.lokasi}` : '';
    const kuotaStr = options.kuota ? `\nKuota: ${options.kuota}` : '';
    const deadlineStr = options.deadline ? `\nBatas Pendaftaran: ${options.deadline}` : '';
    const descRaw = stripHtmlTags(options.summary || options.deskripsi, title);
    const descStr = descRaw ? `\n\nDeskripsi Program Magang:\n"${descRaw.slice(0, 180).replace(/\.*$/, '')}..."` : '';

    return (
      `INFO MAGANG INDUSTRI BERSERTIFIKAT CDC UMK\n\n` +
      `${title}${instansiStr}${lokasiStr}${kuotaStr}${deadlineStr}${descStr}\n\n` +
      `Informasi kualifikasi & pendaftaran magang online:\n` +
      `👉 ${targetUrl}\n\n` +
      `#MagangIndustri #Internship #CDCUMKendari #UMKendari`
    );
  }

  if (options.type === 'prestasi') {
    const mhsStr = options.namaMahasiswa ? `\nMahasiswa/Tim: ${options.namaMahasiswa}` : '';
    const prodiStr = options.prodi ? ` (${options.prodi})` : '';
    const rkStr = options.peringkat ? `\nCapaian: ${options.peringkat}` : '';
    const scopeStr = options.scope ? ` - Tingkat ${options.scope.toUpperCase()}` : '';
    const thnStr = options.tahun ? ` (${options.tahun})` : '';
    const descRaw = stripHtmlTags(options.summary || options.deskripsi, title);
    const descStr = descRaw ? `\n\nRincian Capaian:\n"${descRaw.slice(0, 180).replace(/\.*$/, '')}..."` : '';

    return (
      `PRESTASI MAHASISWA UNIVERSITAS MUHAMMADIYAH KENDARI\n\n` +
      `${title}${mhsStr}${prodiStr}${rkStr}${scopeStr}${thnStr}${descStr}\n\n` +
      `Baca kisah sukses & rincian penghargaan selengkapnya di Portal CDC UMK:\n` +
      `👉 ${targetUrl}\n\n` +
      `#MahasiswaBerprestasi #UMKendari #CDCUMKendari #Prestasi`
    );
  }

  if (options.type === 'berita') {
    const scopeStr = options.scope ? ` - Tingkat ${options.scope.toUpperCase()}` : '';
    const authorStr = options.author ? ` | Penulis: ${options.author}` : '';
    const descRaw = stripHtmlTags(options.summary || options.deskripsi, title);
    const descStr = descRaw ? `\n\nRingkasan Berita:\n"${descRaw.slice(0, 200).replace(/\.*$/, '')}..."` : '';

    return (
      `BERITA & WAWASAN KARIR TERKINI CDC UMK${scopeStr}\n\n` +
      `${title}${authorStr}${descStr}\n\n` +
      `Baca ulasan berita & artikel selengkapnya di Portal CDC UM Kendari:\n` +
      `👉 ${targetUrl}\n\n` +
      `#BeritaUMKendari #WawasanKarir #CDCUMKendari #UMKendari`
    );
  }

  if (options.type === 'campus_hiring') {
    const instansiStr = options.namaInstansi ? `\nPerusahaan: ${options.namaInstansi}` : '';
    const tglStr = options.tanggal ? `\nPelaksanaan: ${options.tanggal}` : '';
    const lokasiStr = options.lokasi ? `\nLokasi: ${options.lokasi}` : '';
    const descRaw = stripHtmlTags(options.summary || options.deskripsi, title);
    const descStr = descRaw ? `\n\nInformasi Rekrutmen:\n"${descRaw.slice(0, 180).replace(/\.*$/, '')}..."` : '';

    return (
      `CAMPUS HIRING — REKRUTMEN LANGSUNG DI KAMPUS\n\n` +
      `${title}${instansiStr}${tglStr}${lokasiStr}${descStr}\n\n` +
      `Registrasi peserta & persiapkan berkas lamaran di sini:\n` +
      `👉 ${targetUrl}\n\n` +
      `#CampusHiring #RekrutmenKampus #CDCUMKendari #UMKendari`
    );
  }

  if (options.type === 'job_fair') {
    const lokasiStr = options.lokasi ? `\nLokasi: ${options.lokasi}` : '';
    const tglStr = options.tanggal ? `\nTanggal Pelaksanaan: ${options.tanggal}` : '';
    const descRaw = stripHtmlTags(options.summary || options.deskripsi, title);
    const descStr = descRaw ? `\n\nDeskripsi Kegiatan:\n"${descRaw.slice(0, 180).replace(/\.*$/, '')}..."` : '';

    return (
      `CAREER EXPO & JOB FAIR UMK\n\n` +
      `${title}${lokasiStr}${tglStr}${descStr}\n\n` +
      `Registrasi pengunjung digital & cek daftar perusahaan mitra:\n` +
      `👉 ${targetUrl}\n\n` +
      `#CareerExpo #JobFair #CDCUMKendari #UMKendari`
    );
  }

  if (options.type === 'dokumen') {
    const descRaw = stripHtmlTags(options.summary || options.deskripsi, title);
    const descStr = descRaw ? `\n\nKeterangan Dokumen:\n"${descRaw.slice(0, 180).replace(/\.*$/, '')}..."` : '';

    return (
      `LAYANAN & DOKUMEN RESMI CDC UMK\n\n` +
      `Publikasi: ${title}${descStr}\n\n` +
      `Akses & unduh berkas dokumen resmi selengkapnya:\n` +
      `👉 ${targetUrl}\n\n` +
      `#DokumenResmi #TracerStudy #CDCUMKendari #UMKendari`
    );
  }

  if (options.type === 'event') {
    const catStr = options.kategori ? `\nKategori: ${options.kategori}` : '';
    const tglStr = options.tanggal ? `\nWaktu: ${options.tanggal}` : '';
    const descRaw = stripHtmlTags(options.summary || options.deskripsi, title);
    const descStr = descRaw ? `\n\nDeskripsi Kegiatan:\n"${descRaw.slice(0, 180).replace(/\.*$/, '')}..."` : '';

    return (
      `AGENDA & WORKSHOP PENGEMBANGAN KARIR CDC UMK\n\n` +
      `${title}${catStr}${tglStr}${descStr}\n\n` +
      `Informasi jadwal, fasilitas, & pendaftaran online selengkapnya:\n` +
      `👉 ${targetUrl}\n\n` +
      `#WorkshopKarir #PengembanganDiri #CDCUMKendari #UMKendari`
    );
  }

  // Tipe General / Default Halaman Publik
  return (
    `PORTAL CDC UNIVERSITAS MUHAMMADIYAH KENDARI\n\n` +
    `${title}\n\n` +
    `Pusat Karir, Magang Industri, Tracer Study & Hub Alumni Terpadu.\n` +
    `Jelajahi portal & temukan peluang karirmu sekarang:\n` +
    `👉 ${targetUrl}\n\n` +
    `#PortalCDC #CDCUMKendari #PusatKarir #UMKendari`
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
 */
export async function shareToLinkedIn(
  options: ShareContentOptions,
  onNotifyCopied?: (msg: string) => void
): Promise<void> {
  const targetUrl = options.url || (typeof window !== 'undefined' ? window.location.href : '');
  const caption = generateShareCaption({ ...options, url: targetUrl });

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
  const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(targetUrl)}&text=${encodeURIComponent(caption)}`;
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
