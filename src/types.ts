/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'mahasiswa' | 'alumni' | 'mitra' | 'admin' | 'viewer';
export type UserStatus = 'pending' | 'active' | 'inactive' | 'rejected';
export type TipeLowongan = 'magang' | 'kerja';
export type StatusLowongan = 'draft' | 'published' | 'closed' | 'archived';
export type StatusPengajuan = 'draft' | 'submitted' | 'under_review' | 'revision' | 'accepted' | 'rejected' | 'ongoing' | 'report_submitted' | 'completed';
export type StatusKerjasama = 'aktif' | 'nonaktif' | 'pending';
export type TipeDokumen = 'surat_pengantar' | 'cv' | 'transkrip' | 'proposal' | 'laporan' | 'cover_berita' | 'avatar' | 'lainnya';

export interface User {
  id: string; // alphanumeric generated ID
  name: string;
  email: string;
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
  email: string;
  phone?: string;
  programStudi: string;
  fakultas: string;
  angkatan: string; // e.g. "2022"
  semester: number;
  alamat?: string;
  // Extended Profile Fields
  graduationYear?: string;
  nationality?: string;
  workRights?: string;
  opportunityType?: string;
  preferredStartDate?: string;
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
  lokasi: string;
  deskripsi: string;
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

export interface PengajuanMagang {
  id: string;
  mahasiswaId: string;
  userId: string;
  lowonganId?: string;
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
  kesesuaianBidang?: 'sangat_erat' | 'erat' | 'cukup_erat' | 'kurang_erat' | 'tidak_sama_sekali';
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
}

export interface Pengumuman {
  id: string;
  title: string;
  content: string;
  category: 'magang' | 'tracer_study' | 'lowongan' | 'umum';
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt: string;
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

// ─────────────────────────────────────────────────────────────────
// KONTEN KARIR (Admin — satu model terpadu untuk 5 jenis konten)
// ─────────────────────────────────────────────────────────────────
export type JenisKonten = 'berita' | 'lowongan' | 'program' | 'workshop' | 'softskill';
export type AlignmentGambar = 'kiri' | 'tengah' | 'kanan';

export interface KontenKarir {
  id: string;
  jenis: JenisKonten;           // berita | lowongan | program | workshop | softskill
  judul: string;
  // Body gaya Medium: plain text dengan markup ringan (# H1, ## H2, **bold**, *italic*, __underline__, ---, > quote, daftar)
  body: string;
  // Berita & Artikel
  penulis?: string;
  gambarLain?: string[];        // data URL gambar tambahan (alignment paralel)
  alignment?: AlignmentGambar[];// alignment per gambarLain
  // Lowongan (Magang/Kerja)
  namaInstansi?: string;
  tipe?: 'magang' | 'kerja';
  linkLamar?: string;           // URL lamar
  kategori?: string;
  gaji?: string;
  kuota?: number;
  deadline?: string;            // YYYY-MM-DD
  // Program & Pengumuman / Workshop / SoftSkill (CTA eksternal)
  linkCta?: string;            // URL daftar/register/kontak
  // Thumbnail
  // - berita/workshop/softskill: rasio 16:9 (wajib)
  // - lowongan: rasio 9:16 (poster, wajib)
  // - program: tidak ada
  thumbnail?: string;          // data URL
  // Status & meta
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt?: string;
}
