/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'user' | 'mitra' | 'admin' | 'mahasiswa' | 'alumni' | 'viewer' | 'job_seeker';
export type UserStatus = 'pending' | 'active' | 'inactive' | 'rejected';
export type TipeLowongan = 'magang' | 'kerja';
export type StatusLowongan = 'draft' | 'published' | 'closed' | 'archived';
export type StatusPengajuan = 'draft' | 'submitted' | 'under_review' | 'revision' | 'accepted' | 'rejected' | 'ongoing' | 'report_submitted' | 'completed' | 'menunggu_review' | 'seleksi_administrasi' | 'interview' | 'diterima' | 'ditolak';
export type StatusKerjasama = 'aktif' | 'nonaktif' | 'pending';
export type TipeDokumen = 'surat_pengantar' | 'cv' | 'transkrip' | 'proposal' | 'laporan' | 'cover_berita' | 'avatar' | 'lainnya';

export interface User {
  id: string; // alphanumeric generated ID
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  photoUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Mahasiswa {
  id: string;
  userId: string;
  nim: string;
  nama: string;
  userStatusType?: 'Mahasiswa' | 'Alumni';
  email: string;
  phone?: string;
  programStudi: string;
  fakultas: string;
  angkatan: string; // e.g. "2022"
  semester: number;
  alamat?: string;
  photoUrl?: string;
  aboutMe?: string;
  // Extended Profile Fields
  graduationYear?: string;
  nationality?: string;
  workRights?: string;
  opportunityType?: string;
  preferredStartDate?: string;
  ipk?: string;
  skills?: string[];
  experiences?: Array<{
    id: string;
    position: string;
    company: string;
    period: string;
    description?: string;
  }>;
  certificates?: Array<{
    id: string;
    name: string;
    issuer?: string;
    year: string;
  }>;
  qualifications?: Array<{
    id: string;
    institution: string;
    level: string;
    year: string;
    ipk?: string;
  }>;
  languages?: Array<{
    id: string;
    name: string;
    level: string;
  }>;
  gender?: string;
  sendOpportunities?: string;
  cvName?: string;
  industries?: string;
  locations?: string;
  university?: string;
}

export type JenisKonten = 'berita' | 'lowongan' | 'program' | 'pengumuman' | 'workshop' | 'softskill' | 'seminar' | 'presentasi';

export interface EventLayananItem {
  id: string;
  category: 'workshop' | 'softskill' | 'seminar';
  title: string;
  organizer: string;
  date: string; // YYYY-MM-DD
  time?: string;
  location: string;
  image: string;
  description: string;
  speaker?: string;
  quota?: number;
  registeredCount?: number;
  registrationLink?: string;
  status: 'buka' | 'segera' | 'selesai';
  uploadedAt?: string; // ISO waktu upload (tie-breaker sorting)
}

export interface KontenKarir {
  id: string;
  jenis: JenisKonten;
  judul: string;
  body: string;
  penulis?: string;
  namaInstansi?: string;
  tipe?: 'magang' | 'kerja';
  linkLamar?: string;
  kategori?: string;
  gaji?: string;
  kuota?: number;
  deadline?: string;
  linkCta?: string;
  thumbnail?: string;
  scope?: 'LOKAL' | 'REGIONAL' | 'NASIONAL' | 'GLOBAL';
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt?: string;
  createdBy?: string; // user.id — 'usr_admin' untuk konten buatan admin
  createdByName?: string; // nama pembuat, untuk tracking
  // Field khusus event layanan (workshop / softskill / seminar)
  tanggal?: string; // YYYY-MM-DD
  waktu?: string; // mis. "09:00 - 14:00 WITA"
  lokasiEvent?: string; // lokasi pelaksanaan kegiatan
  pembicara?: string;
  kuotaEvent?: number;
  terdaftar?: number;
  linkDaftar?: string; // URL pendaftaran eksternal
  statusEvent?: 'buka' | 'segera' | 'selesai';
  // Field khusus Presentasi (konversi dari Prestasi)
  subKategori?: 'akademik' | 'non-akademik'; // kategori Akademik / Non-Akademik
  namaMahasiswa?: string;
  prodi?: string;
  tahun?: string;
  peringkat?: string; // misal "Juara 1", "Gold Medal", "Best Presenter"
  terverifikasi?: boolean;
  isPinned?: boolean; // Penanda sematan (Pin) ke Popular Info
  showOnHome?: boolean; // Pilihan tampilkan di Beranda Utama (Section Berita & Artikel)
  layoutType?: 'card' | 'badge'; // Pilihan Layout: 'card' (Card Gambar) vs 'badge' (Model Badge Khusus)
}

export interface Alumni {
  id: string;
  userId: string;
  nim?: string;
  nama: string;
  email: string;
  phone?: string;
  programStudi: string;
  fakultas: string;
  tahunLulus: string; // e.g. "2024"
  statusPekerjaan: 'bekerja' | 'wirausaha' | 'lanjut_studi' | 'belum_bekerja';
  instansiKerja?: string;
  jabatan?: string;
}

export interface Mitra {
  id: string;
  userId: string;
  namaInstansi: string;
  bidangIndustri?: string;
  alamat?: string;
  kontakPerson: string;
  email: string;
  phone?: string;
  website?: string;
  statusKerjaSama: StatusKerjasama;
}

export interface Lowongan {
  id: string;
  mitraId?: string;
  createdBy: string; // user.id
  judul: string;
  tipe: TipeLowongan;
  namaInstansi: string;
  companyLogo?: string;
  bannerImage?: string;
  imageUrl?: string; // poster / flyer image URL
  flyer?: string; // alias for poster image
  flyers?: string[]; // Array of poster/flyer image URLs
  sumber?: 'admin' | 'mitra'; // penanda asal input: admin CDC atau mitra
  linkEksternal?: string; // URL eksternal opsional (dibungkus button di public)
  jenisPekerjaan?: 'full-time' | 'part-time'; // jenis pekerjaan: full-time / part-time
  ctaEnabled?: boolean; // khusus admin: tampilkan tombol CTA utama di detail?
  ctaLabel?: string; // khusus admin: teks tombol CTA (default 'Daftar Sekarang')
  isPinned?: boolean; // Penanda sematan (Pin) ke Popular Info
  lokasi: string;
  deskripsi?: string;
  kualifikasi: string[]; // parsed from JSON array
  tanggungJawab?: string[];
  keahlian?: string[];
  kategori?: string;
  gaji?: string;
  benefit: string[]; // parsed from JSON array
  kuota?: number;
  deadline: string; // YYYY-MM-DD
  status: StatusLowongan;
  createdAt: string;
}

export interface SelectionHistoryLog {
  status: string;
  label: string;
  date: string;
  note?: string;
}

export interface PengajuanMagang {
  id: string;
  mahasiswaId: string;
  userId: string;
  lowonganId?: string;
  mitraId?: string;
  namaInstansi?: string;
  namaMahasiswa: string;
  nim: string;
  programStudi: string;
  tujuanMagang: string;
  lokasiMagang?: string;
  catatan?: string;
  berkasUrl?: string;
  berkasNama?: string;
  tanggalMulai?: string; // YYYY-MM-DD
  tanggalSelesai?: string; // YYYY-MM-DD
  status: StatusPengajuan;
  catatanAdmin?: string;
  verifiedBy?: string; // user.id
  verifiedAt?: string;
  createdAt: string;

  // Multi-stage Interview & Selection Fields
  interviewStatus?: 'pending' | 'scheduled' | 'completed';
  interviewDate?: string;
  interviewTime?: string;
  interviewMethod?: 'online' | 'offline';
  interviewLink?: string;
  interviewLocation?: string;
  interviewNote?: string;
  interviewResultNotes?: string;
  catatanInternal?: string[];
  riwayatSeleksi?: SelectionHistoryLog[];

  // Profile Snapshot Fields
  ipk?: string;
  email?: string;
  telepon?: string;
  noHp?: string;
  skills?: string[];
  experiences?: Array<{
    id: string;
    position: string;
    company: string;
    period: string;
    description?: string;
  }>;
  certificates?: Array<{
    id: string;
    name: string;
    issuer?: string;
    year: string;
  }>;
  qualifications?: Array<{
    id: string;
    institution: string;
    level: string;
    year: string;
    ipk?: string;
  }>;
}

export interface UploadedDocument {
  id: string;
  ownerUserId: string;
  pengajuanId?: string;
  name: string;
  type: TipeDokumen;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface TracerStudy {
  id: string;
  alumniId: string;
  userId: string;
  nama: string;
  programStudi: string;
  tahunLulus: string;
  statusPekerjaan: 'bekerja' | 'wirausaha' | 'lanjut_studi' | 'belum_bekerja';
  masaTungguKerja?: 'kurang_3_bulan' | '3_6_bulan' | '6_12_bulan' | 'lebih_12_bulan';
  namaInstansi?: string;
  jabatan?: string;
  bidangPekerjaan?: string;
  kesesuaianBidang?: 'sangat_sesuai' | 'sesuai' | 'cukup_sesuai' | 'kurang_sesuai' | 'tidak_sesuai' | 'sangat_erat' | 'erat' | 'cukup_erat' | 'kurang_erat' | 'tidak_sama_sekali';
  rangePenghasilan?: 'kurang_2jt' | '2_5jt' | '5_10jt' | 'lebih_10jt';
  saranUntukKampus?: string;
  submittedAt: string;
}

export interface Berita {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  status: 'draft' | 'published';
  authorId: string;
  publishedAt?: string;
  createdAt: string;
  scope?: 'LOKAL' | 'REGIONAL' | 'NASIONAL' | 'GLOBAL';
  penulis?: string;
}

export interface Pengumuman {
  id: string;
  title: string;
  content: string;
  category: 'magang' | 'tracer_study' | 'lowongan' | 'umum';
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt: string;
  isImportant?: boolean;
  displayType?: 'badge' | 'poster';
  posterUrl?: string;
  linkUrl?: string;
  linkLabel?: string;
  showBadge?: boolean;
  badgeText?: string;
  showBadgeIcon?: boolean;
}

export interface SurveiLulusan {
  id: string;
  mitraId: string;
  namaInstansi: string;
  alumniId?: string;
  kualitasLulusan: number; // 1-5 or 1-100
  kemampuanTeknis: number;
  kemampuanKomunikasi: number;
  etikaKerja: number;
  kemampuanKerjaTim: number;
  saran?: string;
  submittedAt: string;
}

export interface Prestasi {
  id: string;
  judul: string;
  tingkat: 'internasional' | 'nasional' | 'wilayah';
  kategori: 'akademik' | 'non-akademik';
  peringkat: string; // misal: "Juara 1 / Gold Medal", "Juara 2 / Silver Medal", "Juara 3", "Best Presenter"
  tahun: string;
  namaMahasiswa: string;
  prodi?: string;
  deskripsi: string;
  imageUrl?: string;
  terverifikasi: boolean;
  status: 'published' | 'draft';
  createdAt: string;
  createdBy?: string;
}

export interface SuratKeputusan {
  id: string;
  judul: string;
  kategori: string;
  tipe: 'pdf' | 'link';
  pdfUrl?: string;
  linkUrl?: string;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface KalenderKegiatan {
  id: string;
  judul: string;
  kategori: string;
  displayType: 'poster' | 'pdf'; // 2 pilihan tampilan admin
  posterUrl?: string; // Data URL / URL gambar poster
  pdfUrl?: string;    // Data URL / URL file PDF
  linkUrl?: string;   // URL eksternal opsional
  isFeatured?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface LaporanKinerja {
  id: string;
  judul: string;
  kategori: string;
  tipe: 'pdf' | 'link';
  pdfUrl?: string;
  linkUrl?: string;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface MouStakeholder {
  id: string;
  judul: string;
  kategori: string;
  displayType: 'poster' | 'pdf' | 'link'; // Tampilan Poster Gambar, PDF, atau Link
  posterUrl?: string;
  pdfUrl?: string;
  linkUrl?: string;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface GaleriItem {
  id: string;
  judul: string;
  kategoriSection: string; // e.g. 'Kegiatan Terkini 2026', 'Galeri Kegiatan 2025', 'Majalah & Survei'
  tipeMedia: 'youtube' | 'poster' | 'pdf'; // 3 pilihan media
  youtubeUrl?: string;
  posterUrl?: string;
  pdfUrl?: string;
  linkUrl?: string;
  deskripsi?: string;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface KonselingInfoItem {
  id: string;
  judul: string;
  deskripsi: string;
  linkUrl?: string;
  linkLabel?: string;
}

export interface KonselingJadwalItem {
  id: string;
  hari: string;
  jam: string;
  lokasi: string;
  kuotaPerHari?: string;
  status: 'buka' | 'penuh' | 'tutup';
}

export interface KonselingConfig {
  id: string;
  title: string;
  subtitle: string;
  posterUrl: string;
  posterAlt?: string;
  infoItems: KonselingInfoItem[];
  jadwalItems: KonselingJadwalItem[];
  narasiWa: string;
  adminWaNumber: string;
  adminWaDefaultMessage: string;
  /** Flag publikasi konseling (seragam dgn draft/published Konten Karir). */
  published?: boolean;
  updatedAt?: string;
}

/** Config Visi & Misi (tampil di beranda publik, section "Tentang Kami"). */
export interface VisiMisiConfig {
  id: string;
  imageUrl: string; // bisa file lokal (data URL) hasil upload admin, atau fallback svg
  updatedAt?: string;
}

export interface AnggotaTim {
  id: string;
  nama: string;
  jabatan: string;
  fotoUrl: string;
  urutan?: number;
}

export interface SocialMediaItem {
  id: string;
  platform: 'facebook' | 'instagram' | 'youtube' | 'website' | 'tiktok' | 'twitter' | 'linkedin';
  label: string;
  url: string;
  isActive: boolean;
  hoverColor?: string;
}

export interface HelpdeskConfig {
  email: string;
  whatsappNumber: string;
  whatsappNote: string;
  jamLayanan?: string;
  defaultMessage?: string;
  isFloatingActive?: boolean;
}

export type StatusKomentar = 'pending' | 'approved' | 'rejected';

export interface KomentarBerita {
  id: string;
  beritaSlug: string; // slug berita tujuan (Berita.slug / KontenKarir -> 'kk-<id>')
  beritaJudul: string; // judul berita (snapshot, agar admin mudah baca)
  nama: string;
  email: string;
  komentar: string;
  createdAt: string; // ISO
  status: StatusKomentar;
}

export interface CdcClubConfig {
  id: string;
  published: boolean;        // true = card beranda + badge footer tampil
  title: string;             // baris judul (mis. "CDC UM KENDARI CLUB")
  subtitle: string;          // deskripsi di bawah judul
  buttonText: string;        // teks tombol (mis. "Gabung Komunitas")
  buttonUrl: string;         // URL tujuan saat tombol diklik
}

export interface HeroSlideItem {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl?: string; // Tautan tab e.g. "lowongan", "berita", "tracer-study" atau URL eksternal "https://..."
  alt?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export interface CampusHiringItem {
  id: string;
  judul: string;
  namaPerusahaan: string;
  logoPerusahaan?: string;
  bannerUrl?: string; // Poster 9:16 atau 16:9
  tanggal: string; // YYYY-MM-DD
  waktu?: string; // e.g. "08:30 - 15:00 WITA"
  lokasi: string; // e.g. "Aula Rektorat Lt. 2 UM Kendari"
  tipe: 'on-campus' | 'virtual';
  linkVirtual?: string;
  persyaratan: string[];
  posisiBuka: string[];
  kuota?: number;
  terdaftarCount?: number;
  linkFormDaftar?: string;
  deskripsi?: string;
  status: 'buka' | 'proses' | 'selesai';
  createdAt: string;
}

export interface JobFairCompany {
  id: string;
  nama: string;
  logo?: string;
  bidang?: string;
}

export interface JobFairItem {
  id: string;
  judul: string; // e.g. "UMK Career Expo & Job Fair 2026"
  tagline?: string;
  bannerUrl?: string;
  tanggalMulai: string; // YYYY-MM-DD
  tanggalSelesai: string; // YYYY-MM-DD
  waktu?: string;
  lokasi: string;
  htm: string; // e.g. "Gratis Khusus Mahasiswa & Alumni UMK"
  perusahaanPeserta?: JobFairCompany[];
  deskripsi?: string;
  linkPendaftaranTiket?: string;
  status: 'buka' | 'berlangsung' | 'selesai';
  createdAt: string;
}
