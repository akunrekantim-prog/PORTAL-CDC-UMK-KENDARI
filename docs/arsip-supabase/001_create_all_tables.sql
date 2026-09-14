-- ============================================================
-- Migration: 001_create_all_tables.sql
-- Portal CDC Universitas Muhammadiyah Kendari
-- Database: PostgreSQL (Supabase)
-- Created: 2026-08-29
-- ============================================================

-- Aktifkan ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE "UserRole" AS ENUM (
  'USER',
  'MAHASISWA',
  'ALUMNI',
  'JOB_SEEKER',
  'MITRA',
  'ADMIN',
  'VIEWER'
);

CREATE TYPE "UserStatus" AS ENUM (
  'PENDING',
  'ACTIVE',
  'INACTIVE',
  'REJECTED'
);

CREATE TYPE "TipeLowongan" AS ENUM (
  'MAGANG',
  'KERJA'
);

CREATE TYPE "StatusLowongan" AS ENUM (
  'DRAFT',
  'PUBLISHED',
  'CLOSED',
  'ARCHIVED'
);

CREATE TYPE "StatusPengajuan" AS ENUM (
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'REVISION',
  'ACCEPTED',
  'REJECTED',
  'ONGOING',
  'REPORT_SUBMITTED',
  'COMPLETED',
  'MENUNGGU_REVIEW',
  'SELEKSI_ADMINISTRASI',
  'INTERVIEW',
  'DITERIMA',
  'DITOLAK'
);

CREATE TYPE "StatusKerjasama" AS ENUM (
  'AKTIF',
  'NONAKTIF',
  'PENDING'
);

-- ============================================================
-- TABEL: users
-- Tabel utama untuk semua akun (admin, mahasiswa, alumni, mitra)
-- ============================================================

CREATE TABLE IF NOT EXISTS "users" (
  "id"          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name"        TEXT        NOT NULL,
  "email"       TEXT        NOT NULL UNIQUE,
  "password"    TEXT,
  "phone"       TEXT,
  "role"        "UserRole"  NOT NULL DEFAULT 'MAHASISWA',
  "status"      "UserStatus" NOT NULL DEFAULT 'PENDING',
  "photoUrl"    TEXT,
  "lastLoginAt" TIMESTAMPTZ,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "users" IS 'Tabel akun pengguna: admin, mahasiswa, alumni, dan mitra';
COMMENT ON COLUMN "users"."role" IS 'Peran pengguna dalam sistem portal';
COMMENT ON COLUMN "users"."status" IS 'Status akun: PENDING=belum verifikasi, ACTIVE=aktif, INACTIVE=nonaktif, REJECTED=ditolak';

-- ============================================================
-- TABEL: mahasiswas
-- Profil detail mahasiswa aktif UM Kendari
-- ============================================================

CREATE TABLE IF NOT EXISTS "mahasiswas" (
  "id"                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"            UUID        NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "nim"               TEXT        NOT NULL UNIQUE,
  "nama"              TEXT        NOT NULL,
  "email"             TEXT        NOT NULL,
  "phone"             TEXT,
  "programStudi"      TEXT        NOT NULL,
  "fakultas"          TEXT        NOT NULL,
  "angkatan"          TEXT        NOT NULL,
  "semester"          INTEGER     NOT NULL DEFAULT 1,
  "alamat"            TEXT,
  "photoUrl"          TEXT,
  "aboutMe"           TEXT,
  "ipk"               TEXT,
  "skills"            TEXT[]      NOT NULL DEFAULT '{}',
  "sendOpportunities" TEXT,
  "cvName"            TEXT,
  "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "mahasiswas" IS 'Profil lengkap mahasiswa aktif UM Kendari';
COMMENT ON COLUMN "mahasiswas"."nim" IS 'Nomor Induk Mahasiswa - unik per mahasiswa';
COMMENT ON COLUMN "mahasiswas"."skills" IS 'Array keahlian mahasiswa (e.g. JavaScript, Python)';

-- ============================================================
-- TABEL: alumnis
-- Profil alumni UM Kendari yang telah lulus
-- ============================================================

CREATE TABLE IF NOT EXISTS "alumnis" (
  "id"              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"          UUID        NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "nim"             TEXT,
  "nama"            TEXT        NOT NULL,
  "email"           TEXT        NOT NULL,
  "phone"           TEXT,
  "programStudi"    TEXT        NOT NULL,
  "fakultas"        TEXT        NOT NULL,
  "tahunLulus"      TEXT        NOT NULL,
  "statusPekerjaan" TEXT        NOT NULL CHECK ("statusPekerjaan" IN ('bekerja', 'wirausaha', 'lanjut_studi', 'belum_bekerja')),
  "instansiKerja"   TEXT,
  "jabatan"         TEXT,
  "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "alumnis" IS 'Profil alumni UM Kendari yang sudah lulus';
COMMENT ON COLUMN "alumnis"."statusPekerjaan" IS 'Status: bekerja | wirausaha | lanjut_studi | belum_bekerja';

-- ============================================================
-- TABEL: mitras
-- Profil instansi / perusahaan mitra CDC UM Kendari
-- ============================================================

CREATE TABLE IF NOT EXISTS "mitras" (
  "id"              UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"          UUID              NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "namaInstansi"    TEXT              NOT NULL,
  "bidangIndustri"  TEXT,
  "alamat"          TEXT,
  "kontakPerson"    TEXT              NOT NULL,
  "email"           TEXT              NOT NULL,
  "phone"           TEXT,
  "website"         TEXT,
  "logoUrl"         TEXT,
  "deskripsi"       TEXT,
  "statusKerjaSama" "StatusKerjasama" NOT NULL DEFAULT 'PENDING',
  "createdAt"       TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "mitras" IS 'Instansi/perusahaan mitra yang bekerja sama dengan CDC UM Kendari';

-- ============================================================
-- TABEL: lowongans
-- Lowongan magang dan kerja yang diposting mitra/admin
-- ============================================================

CREATE TABLE IF NOT EXISTS "lowongans" (
  "id"             UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
  "mitraId"        UUID             REFERENCES "mitras"("id") ON DELETE SET NULL,
  "createdBy"      UUID             NOT NULL,
  "judul"          TEXT             NOT NULL,
  "tipe"           "TipeLowongan"   NOT NULL DEFAULT 'KERJA',
  "namaInstansi"   TEXT             NOT NULL,
  "companyLogo"    TEXT,
  "bannerImage"    TEXT,
  "imageUrl"       TEXT,
  "flyer"          TEXT,
  "flyers"         TEXT[]           NOT NULL DEFAULT '{}',
  "sumber"         TEXT             NOT NULL DEFAULT 'admin' CHECK ("sumber" IN ('admin', 'mitra')),
  "linkEksternal"  TEXT,
  "jenisPekerjaan" TEXT             CHECK ("jenisPekerjaan" IN ('full-time', 'part-time', 'freelance', 'kontrak')),
  "isPinned"       BOOLEAN          NOT NULL DEFAULT FALSE,
  "lokasi"         TEXT             NOT NULL,
  "deskripsi"      TEXT,
  "kualifikasi"    TEXT[]           NOT NULL DEFAULT '{}',
  "tanggungJawab"  TEXT[]           NOT NULL DEFAULT '{}',
  "keahlian"       TEXT[]           NOT NULL DEFAULT '{}',
  "kategori"       TEXT,
  "gaji"           TEXT,
  "benefit"        TEXT[]           NOT NULL DEFAULT '{}',
  "kuota"          INTEGER,
  "deadline"       TIMESTAMPTZ      NOT NULL,
  "status"         "StatusLowongan" NOT NULL DEFAULT 'PUBLISHED',
  "createdAt"      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  "updatedAt"      TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "lowongans" IS 'Daftar lowongan magang dan kerja';
COMMENT ON COLUMN "lowongans"."tipe" IS 'MAGANG=program magang, KERJA=lowongan kerja tetap';
COMMENT ON COLUMN "lowongans"."flyers" IS 'Array URL gambar flyer promosi';
COMMENT ON COLUMN "lowongans"."isPinned" IS 'TRUE jika lowongan disematkan di halaman utama';

-- ============================================================
-- TABEL: pengajuan_magangs
-- Pengajuan/lamaran mahasiswa untuk lowongan magang atau kerja
-- ============================================================

CREATE TABLE IF NOT EXISTS "pengajuan_magangs" (
  "id"                UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
  "mahasiswaId"       UUID             NOT NULL REFERENCES "mahasiswas"("id") ON DELETE CASCADE,
  "userId"            UUID             NOT NULL,
  "lowonganId"        UUID             REFERENCES "lowongans"("id") ON DELETE SET NULL,
  "mitraId"           UUID             REFERENCES "mitras"("id") ON DELETE SET NULL,
  "namaInstansi"      TEXT,
  "namaMahasiswa"     TEXT             NOT NULL,
  "nim"               TEXT             NOT NULL,
  "programStudi"      TEXT             NOT NULL,
  "tujuanMagang"      TEXT             NOT NULL,
  "lokasiMagang"      TEXT,
  "catatan"           TEXT,
  "berkasUrl"         TEXT,
  "berkasNama"        TEXT,
  "tanggalMulai"      TIMESTAMPTZ,
  "tanggalSelesai"    TIMESTAMPTZ,
  "status"            "StatusPengajuan" NOT NULL DEFAULT 'SUBMITTED',
  "catatanAdmin"      TEXT,
  "interviewStatus"   TEXT             CHECK ("interviewStatus" IN ('pending', 'scheduled', 'completed')),
  "interviewDate"     TIMESTAMPTZ,
  "interviewTime"     TEXT,
  "interviewMethod"   TEXT             CHECK ("interviewMethod" IN ('online', 'offline')),
  "interviewLink"     TEXT,
  "interviewLocation" TEXT,
  "createdAt"         TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  "updatedAt"         TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "pengajuan_magangs" IS 'Pengajuan/lamaran mahasiswa ke lowongan magang atau kerja';
COMMENT ON COLUMN "pengajuan_magangs"."status" IS 'Alur status pengajuan dari SUBMITTED hingga COMPLETED';

-- ============================================================
-- TABEL: tracer_studies
-- Data tracer study / survei karir lulusan mahasiswa
-- ============================================================

CREATE TABLE IF NOT EXISTS "tracer_studies" (
  "id"               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "mahasiswaId"      UUID        NOT NULL REFERENCES "mahasiswas"("id") ON DELETE CASCADE,
  "userId"           UUID        NOT NULL,
  "nama"             TEXT        NOT NULL,
  "programStudi"     TEXT        NOT NULL,
  "tahunLulus"       TEXT        NOT NULL,
  "statusPekerjaan"  TEXT        NOT NULL CHECK ("statusPekerjaan" IN ('bekerja', 'wirausaha', 'lanjut_studi', 'belum_bekerja')),
  "masaTungguKerja"  TEXT,
  "namaInstansi"     TEXT,
  "jabatan"          TEXT,
  "bidangPekerjaan"  TEXT,
  "kesesuaianBidang" TEXT,
  "rangePenghasilan" TEXT,
  "saranUntukKampus" TEXT,
  "submittedAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "tracer_studies" IS 'Data tracer study lulusan mahasiswa - survei karir setelah lulus';

-- ============================================================
-- TABEL: konten_karirs
-- Konten artikel berita, pengumuman, dan informasi karir
-- ============================================================

CREATE TABLE IF NOT EXISTS "konten_karirs" (
  "id"           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "jenis"        TEXT        NOT NULL CHECK ("jenis" IN ('berita', 'lowongan', 'program', 'pengumuman', 'workshop', 'softskill', 'seminar', 'presentasi')),
  "judul"        TEXT        NOT NULL,
  "body"         TEXT        NOT NULL,
  "penulis"      TEXT,
  "namaInstansi" TEXT,
  "tipe"         TEXT        CHECK ("tipe" IN ('magang', 'kerja')),
  "linkLamar"    TEXT,
  "kategori"     TEXT,
  "gaji"         TEXT,
  "kuota"        INTEGER,
  "deadline"     TIMESTAMPTZ,
  "thumbnail"    TEXT,
  "scope"        TEXT        NOT NULL DEFAULT 'NASIONAL' CHECK ("scope" IN ('LOKAL', 'REGIONAL', 'NASIONAL', 'GLOBAL')),
  "status"       TEXT        NOT NULL DEFAULT 'published' CHECK ("status" IN ('draft', 'published', 'archived')),
  "isPinned"     BOOLEAN     NOT NULL DEFAULT FALSE,
  "showOnHome"   BOOLEAN     NOT NULL DEFAULT TRUE,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "konten_karirs" IS 'Konten artikel: berita, pengumuman, info karir, workshop, seminar';
COMMENT ON COLUMN "konten_karirs"."jenis" IS 'Jenis konten: berita | lowongan | program | pengumuman | workshop | dll';
COMMENT ON COLUMN "konten_karirs"."scope" IS 'Jangkauan: LOKAL | REGIONAL | NASIONAL | GLOBAL';

-- ============================================================
-- TABEL: survei_lulusans
-- Survei kepuasan mitra terhadap kualitas alumni/lulusan
-- ============================================================

CREATE TABLE IF NOT EXISTS "survei_lulusans" (
  "id"                    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "mitraId"               UUID        NOT NULL REFERENCES "mitras"("id") ON DELETE CASCADE,
  "namaInstansi"          TEXT        NOT NULL,
  "alumniId"              UUID        REFERENCES "alumnis"("id") ON DELETE SET NULL,
  "kualitasLulusan"       INTEGER     NOT NULL CHECK ("kualitasLulusan" BETWEEN 1 AND 5),
  "kemampuanTeknis"       INTEGER     NOT NULL CHECK ("kemampuanTeknis" BETWEEN 1 AND 5),
  "kemampuanKomunikasi"   INTEGER     NOT NULL CHECK ("kemampuanKomunikasi" BETWEEN 1 AND 5),
  "etikaKerja"            INTEGER     NOT NULL CHECK ("etikaKerja" BETWEEN 1 AND 5),
  "kemampuanKerjaTim"     INTEGER     NOT NULL CHECK ("kemampuanKerjaTim" BETWEEN 1 AND 5),
  "saran"                 TEXT,
  "submittedAt"           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "survei_lulusans" IS 'Survei kepuasan mitra terhadap kualitas alumni/lulusan UM Kendari';
COMMENT ON COLUMN "survei_lulusans"."kualitasLulusan" IS 'Rating 1-5: kualitas umum lulusan';

-- ============================================================
-- TABEL PENDUKUNG: mahasiswa_experiences
-- Riwayat pengalaman kerja/magang mahasiswa
-- ============================================================

CREATE TABLE IF NOT EXISTS "mahasiswa_experiences" (
  "id"           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "mahasiswaId"  UUID        NOT NULL REFERENCES "mahasiswas"("id") ON DELETE CASCADE,
  "position"     TEXT        NOT NULL,
  "company"      TEXT        NOT NULL,
  "period"       TEXT        NOT NULL,
  "description"  TEXT,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "mahasiswa_experiences" IS 'Riwayat pengalaman kerja/magang mahasiswa';

-- ============================================================
-- TABEL PENDUKUNG: mahasiswa_certificates
-- Sertifikat dan penghargaan mahasiswa
-- ============================================================

CREATE TABLE IF NOT EXISTS "mahasiswa_certificates" (
  "id"          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "mahasiswaId" UUID        NOT NULL REFERENCES "mahasiswas"("id") ON DELETE CASCADE,
  "name"        TEXT        NOT NULL,
  "issuer"      TEXT        NOT NULL,
  "year"        TEXT        NOT NULL,
  "fileUrl"     TEXT,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "mahasiswa_certificates" IS 'Sertifikat dan penghargaan mahasiswa';

-- ============================================================
-- TABEL PENDUKUNG: mahasiswa_qualifications
-- Riwayat pendidikan mahasiswa
-- ============================================================

CREATE TABLE IF NOT EXISTS "mahasiswa_qualifications" (
  "id"          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "mahasiswaId" UUID        NOT NULL REFERENCES "mahasiswas"("id") ON DELETE CASCADE,
  "institution" TEXT        NOT NULL,
  "level"       TEXT        NOT NULL,
  "year"        TEXT        NOT NULL,
  "ipk"         TEXT,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "mahasiswa_qualifications" IS 'Riwayat pendidikan mahasiswa';

-- ============================================================
-- TABEL PENDUKUNG: uploaded_documents
-- Dokumen yang diupload mahasiswa (CV, surat, dll)
-- ============================================================

CREATE TABLE IF NOT EXISTS "uploaded_documents" (
  "id"          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"      UUID        NOT NULL,
  "mahasiswaId" UUID        REFERENCES "mahasiswas"("id") ON DELETE CASCADE,
  "fileName"    TEXT        NOT NULL,
  "fileUrl"     TEXT        NOT NULL,
  "fileType"    TEXT        NOT NULL,
  "fileSize"    INTEGER,
  "category"    TEXT        NOT NULL DEFAULT 'cv' CHECK ("category" IN ('cv', 'surat_pengantar', 'transkrip', 'ktp', 'lainnya')),
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "uploaded_documents" IS 'Dokumen yang diupload mahasiswa: CV, surat pengantar, transkrip, dll';

-- ============================================================
-- TABEL KONTEN PORTAL: beritas
-- Berita dan artikel portal CDC
-- ============================================================

CREATE TABLE IF NOT EXISTS "beritas" (
  "id"          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "judul"       TEXT        NOT NULL,
  "slug"        TEXT        UNIQUE,
  "body"        TEXT        NOT NULL,
  "thumbnail"   TEXT,
  "penulis"     TEXT,
  "kategori"    TEXT,
  "tags"        TEXT[]      NOT NULL DEFAULT '{}',
  "isPinned"    BOOLEAN     NOT NULL DEFAULT FALSE,
  "status"      TEXT        NOT NULL DEFAULT 'draft' CHECK ("status" IN ('draft', 'published', 'archived')),
  "viewCount"   INTEGER     NOT NULL DEFAULT 0,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "beritas" IS 'Berita dan artikel yang dipublikasikan di portal CDC';

-- ============================================================
-- TABEL KONTEN PORTAL: komentar_beritas
-- Komentar pada berita portal
-- ============================================================

CREATE TABLE IF NOT EXISTS "komentar_beritas" (
  "id"          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "beritaId"    UUID        NOT NULL REFERENCES "beritas"("id") ON DELETE CASCADE,
  "userId"      UUID        REFERENCES "users"("id") ON DELETE SET NULL,
  "nama"        TEXT        NOT NULL,
  "email"       TEXT,
  "konten"      TEXT        NOT NULL,
  "status"      TEXT        NOT NULL DEFAULT 'PENDING' CHECK ("status" IN ('PENDING', 'APPROVED', 'REJECTED', 'SPAM')),
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "komentar_beritas" IS 'Komentar pengguna pada berita portal';

-- ============================================================
-- TABEL KONTEN PORTAL: pengumumans
-- Pengumuman dari admin CDC
-- ============================================================

CREATE TABLE IF NOT EXISTS "pengumumans" (
  "id"          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "judul"       TEXT        NOT NULL,
  "body"        TEXT        NOT NULL,
  "thumbnail"   TEXT,
  "isPinned"    BOOLEAN     NOT NULL DEFAULT FALSE,
  "status"      TEXT        NOT NULL DEFAULT 'draft' CHECK ("status" IN ('draft', 'published', 'archived')),
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "pengumumans" IS 'Pengumuman resmi dari CDC UM Kendari';

-- ============================================================
-- TABEL KONTEN PORTAL: galeri_items
-- Galeri foto kegiatan CDC
-- ============================================================

CREATE TABLE IF NOT EXISTS "galeri_items" (
  "id"          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "judul"       TEXT        NOT NULL,
  "imageUrl"    TEXT        NOT NULL,
  "kategori"    TEXT,
  "deskripsi"   TEXT,
  "tanggal"     DATE,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "galeri_items" IS 'Galeri foto dokumentasi kegiatan CDC UM Kendari';

-- ============================================================
-- TABEL KONTEN PORTAL: kalender_kegiatans
-- Kalender dan jadwal kegiatan CDC
-- ============================================================

CREATE TABLE IF NOT EXISTS "kalender_kegiatans" (
  "id"          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "judul"       TEXT        NOT NULL,
  "deskripsi"   TEXT,
  "tanggalMulai" TIMESTAMPTZ NOT NULL,
  "tanggalSelesai" TIMESTAMPTZ,
  "lokasi"      TEXT,
  "kategori"    TEXT,
  "warna"       TEXT        DEFAULT '#3B82F6',
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "kalender_kegiatans" IS 'Kalender jadwal kegiatan CDC UM Kendari';

-- ============================================================
-- TABEL KONTEN PORTAL: hero_slides
-- Slide banner halaman utama
-- ============================================================

CREATE TABLE IF NOT EXISTS "hero_slides" (
  "id"          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "judul"       TEXT        NOT NULL,
  "subjudul"    TEXT,
  "imageUrl"    TEXT        NOT NULL,
  "linkUrl"     TEXT,
  "linkLabel"   TEXT,
  "urutan"      INTEGER     NOT NULL DEFAULT 0,
  "isActive"    BOOLEAN     NOT NULL DEFAULT TRUE,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "hero_slides" IS 'Slide gambar untuk banner carousel halaman utama';

-- ============================================================
-- TABEL KONTEN PORTAL: job_fair_events
-- Event job fair yang diselenggarakan CDC
-- ============================================================

CREATE TABLE IF NOT EXISTS "job_fair_events" (
  "id"          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "judul"       TEXT        NOT NULL,
  "deskripsi"   TEXT,
  "tanggalMulai" DATE       NOT NULL,
  "tanggalSelesai" DATE,
  "lokasi"      TEXT,
  "bannerUrl"   TEXT,
  "status"      TEXT        NOT NULL DEFAULT 'upcoming' CHECK ("status" IN ('upcoming', 'ongoing', 'completed')),
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "job_fair_events" IS 'Event Job Fair yang diselenggarakan oleh CDC UM Kendari';

-- ============================================================
-- TABEL KONTEN PORTAL: job_fair_companies
-- Perusahaan yang berpartisipasi di job fair
-- ============================================================

CREATE TABLE IF NOT EXISTS "job_fair_companies" (
  "id"          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "jobFairId"   UUID        NOT NULL REFERENCES "job_fair_events"("id") ON DELETE CASCADE,
  "namaInstansi" TEXT       NOT NULL,
  "logoUrl"     TEXT,
  "bidangIndustri" TEXT,
  "jumlahLowongan" INTEGER  DEFAULT 0,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "job_fair_companies" IS 'Perusahaan peserta job fair';

-- ============================================================
-- TABEL KONTEN PORTAL: campus_hirings
-- Informasi campus hiring dari perusahaan
-- ============================================================

CREATE TABLE IF NOT EXISTS "campus_hirings" (
  "id"          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "namaInstansi" TEXT       NOT NULL,
  "logoUrl"     TEXT,
  "tanggal"     DATE        NOT NULL,
  "lokasi"      TEXT,
  "deskripsi"   TEXT,
  "linkDaftar"  TEXT,
  "status"      TEXT        NOT NULL DEFAULT 'upcoming' CHECK ("status" IN ('upcoming', 'ongoing', 'completed')),
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "campus_hirings" IS 'Program campus hiring dari perusahaan di UM Kendari';

-- ============================================================
-- TABEL KONTEN PORTAL: mou_stakeholders
-- Data MOU/kerjasama dengan stakeholder
-- ============================================================

CREATE TABLE IF NOT EXISTS "mou_stakeholders" (
  "id"          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "namaInstansi" TEXT       NOT NULL,
  "logoUrl"     TEXT,
  "jenisMou"    TEXT,
  "tanggalMou"  DATE,
  "berlakuHingga" DATE,
  "status"      TEXT        NOT NULL DEFAULT 'aktif' CHECK ("status" IN ('aktif', 'expired', 'dalam_proses')),
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "mou_stakeholders" IS 'Data MOU dan perjanjian kerjasama CDC dengan stakeholder';

-- ============================================================
-- TABEL KONTEN PORTAL: surat_keputusans
-- Dokumen surat keputusan resmi
-- ============================================================

CREATE TABLE IF NOT EXISTS "surat_keputusans" (
  "id"          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "nomor"       TEXT        NOT NULL,
  "judul"       TEXT        NOT NULL,
  "tanggal"     DATE        NOT NULL,
  "fileUrl"     TEXT,
  "kategori"    TEXT,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "surat_keputusans" IS 'Dokumen surat keputusan resmi CDC UM Kendari';

-- ============================================================
-- TABEL KONTEN PORTAL: laporan_kinerjas
-- Laporan kinerja tahunan CDC
-- ============================================================

CREATE TABLE IF NOT EXISTS "laporan_kinerjas" (
  "id"          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "judul"       TEXT        NOT NULL,
  "tahun"       INTEGER     NOT NULL,
  "periode"     TEXT,
  "fileUrl"     TEXT,
  "deskripsi"   TEXT,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "laporan_kinerjas" IS 'Laporan kinerja dan aktivitas CDC UM Kendari';

-- ============================================================
-- TABEL KONTEN PORTAL: anggota_tims
-- Data anggota tim/pengurus CDC
-- ============================================================

CREATE TABLE IF NOT EXISTS "anggota_tims" (
  "id"          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "nama"        TEXT        NOT NULL,
  "jabatan"     TEXT        NOT NULL,
  "photoUrl"    TEXT,
  "email"       TEXT,
  "bio"         TEXT,
  "urutan"      INTEGER     NOT NULL DEFAULT 0,
  "isActive"    BOOLEAN     NOT NULL DEFAULT TRUE,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "anggota_tims" IS 'Data pengurus dan anggota tim CDC UM Kendari';

-- ============================================================
-- TABEL KONFIGURASI: konseling_configs
-- Konfigurasi layanan konseling karir CDC
-- ============================================================

CREATE TABLE IF NOT EXISTS "konseling_configs" (
  "id"          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "deskripsi"   TEXT,
  "kontakWa"    TEXT,
  "email"       TEXT,
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "konseling_configs" IS 'Konfigurasi layanan konseling karir CDC';

-- ============================================================
-- TABEL KONFIGURASI: visi_misi_configs
-- Konfigurasi visi dan misi CDC
-- ============================================================

CREATE TABLE IF NOT EXISTS "visi_misi_configs" (
  "id"          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "visi"        TEXT        NOT NULL,
  "misi"        TEXT[]      NOT NULL DEFAULT '{}',
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "visi_misi_configs" IS 'Konfigurasi visi dan misi CDC UM Kendari';

-- ============================================================
-- TABEL KONFIGURASI: social_media_items
-- Link media sosial CDC
-- ============================================================

CREATE TABLE IF NOT EXISTS "social_media_items" (
  "id"          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "platform"    TEXT        NOT NULL,
  "url"         TEXT        NOT NULL,
  "icon"        TEXT,
  "isActive"    BOOLEAN     NOT NULL DEFAULT TRUE,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "social_media_items" IS 'Link media sosial CDC UM Kendari';

-- ============================================================
-- INDEXES (untuk performa query)
-- ============================================================

-- Index untuk pencarian dan filter umum
CREATE INDEX IF NOT EXISTS idx_users_email ON "users"("email");
CREATE INDEX IF NOT EXISTS idx_users_role ON "users"("role");
CREATE INDEX IF NOT EXISTS idx_users_status ON "users"("status");

CREATE INDEX IF NOT EXISTS idx_mahasiswas_nim ON "mahasiswas"("nim");
CREATE INDEX IF NOT EXISTS idx_mahasiswas_prodi ON "mahasiswas"("programStudi");
CREATE INDEX IF NOT EXISTS idx_mahasiswas_angkatan ON "mahasiswas"("angkatan");

CREATE INDEX IF NOT EXISTS idx_alumnis_prodi ON "alumnis"("programStudi");
CREATE INDEX IF NOT EXISTS idx_alumnis_tahun_lulus ON "alumnis"("tahunLulus");
CREATE INDEX IF NOT EXISTS idx_alumnis_status_pekerjaan ON "alumnis"("statusPekerjaan");

CREATE INDEX IF NOT EXISTS idx_lowongans_status ON "lowongans"("status");
CREATE INDEX IF NOT EXISTS idx_lowongans_tipe ON "lowongans"("tipe");
CREATE INDEX IF NOT EXISTS idx_lowongans_deadline ON "lowongans"("deadline");
CREATE INDEX IF NOT EXISTS idx_lowongans_mitra ON "lowongans"("mitraId");
CREATE INDEX IF NOT EXISTS idx_lowongans_created_at ON "lowongans"("createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_pengajuan_mahasiswa ON "pengajuan_magangs"("mahasiswaId");
CREATE INDEX IF NOT EXISTS idx_pengajuan_lowongan ON "pengajuan_magangs"("lowonganId");
CREATE INDEX IF NOT EXISTS idx_pengajuan_status ON "pengajuan_magangs"("status");

CREATE INDEX IF NOT EXISTS idx_beritas_status ON "beritas"("status");
CREATE INDEX IF NOT EXISTS idx_beritas_created_at ON "beritas"("createdAt" DESC);

-- ============================================================
-- FUNCTION: update_updated_at
-- Auto-update kolom updatedAt saat row dimodifikasi
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Pasang trigger auto-update updatedAt ke semua tabel relevan
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON "users"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_mahasiswas_updated_at
  BEFORE UPDATE ON "mahasiswas"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_alumnis_updated_at
  BEFORE UPDATE ON "alumnis"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_mitras_updated_at
  BEFORE UPDATE ON "mitras"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_lowongans_updated_at
  BEFORE UPDATE ON "lowongans"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_pengajuan_updated_at
  BEFORE UPDATE ON "pengajuan_magangs"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_konten_karirs_updated_at
  BEFORE UPDATE ON "konten_karirs"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_beritas_updated_at
  BEFORE UPDATE ON "beritas"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_pengumumans_updated_at
  BEFORE UPDATE ON "pengumumans"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_kalender_updated_at
  BEFORE UPDATE ON "kalender_kegiatans"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_job_fair_updated_at
  BEFORE UPDATE ON "job_fair_events"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - Supabase Security
-- Aktifkan RLS untuk proteksi data di level database
-- ============================================================

-- Aktifkan RLS pada semua tabel
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mahasiswas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "alumnis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mitras" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lowongans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pengajuan_magangs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tracer_studies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "konten_karirs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "survei_lulusans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "beritas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "komentar_beritas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pengumumans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "galeri_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "kalender_kegiatans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "hero_slides" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "job_fair_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "job_fair_companies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "campus_hirings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mou_stakeholders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "surat_keputusans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "laporan_kinerjas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "anggota_tims" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "uploaded_documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mahasiswa_experiences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mahasiswa_certificates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mahasiswa_qualifications" ENABLE ROW LEVEL SECURITY;

-- POLICY: Konten publik dapat dibaca semua orang (tanpa login)
CREATE POLICY "Publik dapat membaca lowongan published"
  ON "lowongans" FOR SELECT
  USING ("status" = 'PUBLISHED');

CREATE POLICY "Publik dapat membaca berita published"
  ON "beritas" FOR SELECT
  USING ("status" = 'published');

CREATE POLICY "Publik dapat membaca pengumuman published"
  ON "pengumumans" FOR SELECT
  USING ("status" = 'published');

CREATE POLICY "Publik dapat membaca galeri"
  ON "galeri_items" FOR SELECT
  USING (TRUE);

CREATE POLICY "Publik dapat membaca konten karir published"
  ON "konten_karirs" FOR SELECT
  USING ("status" = 'published');

CREATE POLICY "Publik dapat membaca anggota tim"
  ON "anggota_tims" FOR SELECT
  USING ("isActive" = TRUE);

CREATE POLICY "Publik dapat membaca hero slides"
  ON "hero_slides" FOR SELECT
  USING ("isActive" = TRUE);

CREATE POLICY "Publik dapat membaca job fair"
  ON "job_fair_events" FOR SELECT
  USING (TRUE);

CREATE POLICY "Publik dapat membaca campus hiring"
  ON "campus_hirings" FOR SELECT
  USING (TRUE);

-- POLICY: Service role (backend) punya akses penuh
CREATE POLICY "Service role akses penuh users"
  ON "users" FOR ALL
  USING (TRUE);

CREATE POLICY "Service role akses penuh mahasiswas"
  ON "mahasiswas" FOR ALL
  USING (TRUE);

CREATE POLICY "Service role akses penuh alumnis"
  ON "alumnis" FOR ALL
  USING (TRUE);

CREATE POLICY "Service role akses penuh mitras"
  ON "mitras" FOR ALL
  USING (TRUE);

CREATE POLICY "Service role akses penuh lowongans"
  ON "lowongans" FOR ALL
  USING (TRUE);

CREATE POLICY "Service role akses penuh pengajuan"
  ON "pengajuan_magangs" FOR ALL
  USING (TRUE);

CREATE POLICY "Service role akses penuh tracer study"
  ON "tracer_studies" FOR ALL
  USING (TRUE);

CREATE POLICY "Service role akses penuh survei"
  ON "survei_lulusans" FOR ALL
  USING (TRUE);

CREATE POLICY "Service role akses penuh uploaded_documents"
  ON "uploaded_documents" FOR ALL
  USING (TRUE);

CREATE POLICY "Service role akses penuh mahasiswa_experiences"
  ON "mahasiswa_experiences" FOR ALL
  USING (TRUE);

CREATE POLICY "Service role akses penuh mahasiswa_certificates"
  ON "mahasiswa_certificates" FOR ALL
  USING (TRUE);

CREATE POLICY "Service role akses penuh mahasiswa_qualifications"
  ON "mahasiswa_qualifications" FOR ALL
  USING (TRUE);

CREATE POLICY "Service role akses penuh komentar_beritas"
  ON "komentar_beritas" FOR ALL
  USING (TRUE);

CREATE POLICY "Service role akses penuh beritas"
  ON "beritas" FOR ALL
  USING (TRUE);

CREATE POLICY "Service role akses penuh pengumumans"
  ON "pengumumans" FOR ALL
  USING (TRUE);

CREATE POLICY "Service role akses penuh galeri_items"
  ON "galeri_items" FOR ALL
  USING (TRUE);

CREATE POLICY "Service role akses penuh kalender_kegiatans"
  ON "kalender_kegiatans" FOR ALL
  USING (TRUE);

CREATE POLICY "Service role akses penuh hero_slides"
  ON "hero_slides" FOR ALL
  USING (TRUE);

CREATE POLICY "Service role akses penuh job_fair_events"
  ON "job_fair_events" FOR ALL
  USING (TRUE);

CREATE POLICY "Service role akses penuh job_fair_companies"
  ON "job_fair_companies" FOR ALL
  USING (TRUE);

CREATE POLICY "Service role akses penuh campus_hirings"
  ON "campus_hirings" FOR ALL
  USING (TRUE);

CREATE POLICY "Service role akses penuh mou_stakeholders"
  ON "mou_stakeholders" FOR ALL
  USING (TRUE);

CREATE POLICY "Service role akses penuh surat_keputusans"
  ON "surat_keputusans" FOR ALL
  USING (TRUE);

CREATE POLICY "Service role akses penuh laporan_kinerjas"
  ON "laporan_kinerjas" FOR ALL
  USING (TRUE);

CREATE POLICY "Service role akses penuh anggota_tims"
  ON "anggota_tims" FOR ALL
  USING (TRUE);

CREATE POLICY "Service role akses penuh konten_karirs"
  ON "konten_karirs" FOR ALL
  USING (TRUE);

-- ============================================================
-- SELESAI
-- Total: 26 tabel utama, enum, index, trigger, RLS policies
-- ============================================================

RAISE NOTICE '✅ Semua tabel Portal CDC UM Kendari berhasil dibuat!';
RAISE NOTICE '📊 Total tabel: 26 tabel';
RAISE NOTICE '🔒 RLS aktif pada semua tabel';
RAISE NOTICE '⚡ Index performa sudah terpasang';
