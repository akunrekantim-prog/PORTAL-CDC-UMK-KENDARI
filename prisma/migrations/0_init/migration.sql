-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'MAHASISWA', 'ALUMNI', 'JOB_SEEKER', 'MITRA', 'ADMIN', 'VIEWER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED');

-- CreateEnum
CREATE TYPE "TipeLowongan" AS ENUM ('MAGANG', 'KERJA');

-- CreateEnum
CREATE TYPE "StatusLowongan" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StatusPengajuan" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'REVISION', 'ACCEPTED', 'REJECTED', 'ONGOING', 'REPORT_SUBMITTED', 'COMPLETED', 'MENUNGGU_REVIEW', 'SELEKSI_ADMINISTRASI', 'INTERVIEW', 'DITERIMA', 'DITOLAK');

-- CreateEnum
CREATE TYPE "StatusKerjasama" AS ENUM ('AKTIF', 'NONAKTIF', 'PENDING');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'MAHASISWA',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "photoUrl" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mahasiswas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "programStudi" TEXT NOT NULL,
    "fakultas" TEXT NOT NULL,
    "angkatan" TEXT NOT NULL,
    "semester" INTEGER NOT NULL DEFAULT 1,
    "alamat" TEXT,
    "photoUrl" TEXT,
    "aboutMe" TEXT,
    "ipk" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sendOpportunities" TEXT,
    "cvName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mahasiswas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alumnis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nim" TEXT,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "programStudi" TEXT NOT NULL,
    "fakultas" TEXT NOT NULL,
    "tahunLulus" TEXT NOT NULL,
    "statusPekerjaan" TEXT NOT NULL,
    "instansiKerja" TEXT,
    "jabatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alumnis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mitras" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "namaInstansi" TEXT NOT NULL,
    "bidangIndustri" TEXT,
    "alamat" TEXT,
    "kontakPerson" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "deskripsi" TEXT,
    "statusKerjaSama" "StatusKerjasama" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mitras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lowongans" (
    "id" TEXT NOT NULL,
    "mitraId" TEXT,
    "createdBy" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "tipe" "TipeLowongan" NOT NULL DEFAULT 'KERJA',
    "namaInstansi" TEXT NOT NULL,
    "companyLogo" TEXT,
    "bannerImage" TEXT,
    "imageUrl" TEXT,
    "flyer" TEXT,
    "flyers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sumber" TEXT NOT NULL DEFAULT 'admin',
    "linkEksternal" TEXT,
    "jenisPekerjaan" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "lokasi" TEXT NOT NULL,
    "deskripsi" TEXT,
    "kualifikasi" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tanggungJawab" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keahlian" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "kategori" TEXT,
    "gaji" TEXT,
    "benefit" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "kuota" INTEGER,
    "deadline" TIMESTAMP(3) NOT NULL,
    "status" "StatusLowongan" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lowongans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengajuan_magangs" (
    "id" TEXT NOT NULL,
    "mahasiswaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lowonganId" TEXT,
    "mitraId" TEXT,
    "namaInstansi" TEXT,
    "namaMahasiswa" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "programStudi" TEXT NOT NULL,
    "tujuanMagang" TEXT NOT NULL,
    "lokasiMagang" TEXT,
    "catatan" TEXT,
    "berkasUrl" TEXT,
    "berkasNama" TEXT,
    "tanggalMulai" TIMESTAMP(3),
    "tanggalSelesai" TIMESTAMP(3),
    "status" "StatusPengajuan" NOT NULL DEFAULT 'SUBMITTED',
    "catatanAdmin" TEXT,
    "interviewStatus" TEXT,
    "interviewDate" TIMESTAMP(3),
    "interviewTime" TEXT,
    "interviewMethod" TEXT,
    "interviewLink" TEXT,
    "interviewLocation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengajuan_magangs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracer_studies" (
    "id" TEXT NOT NULL,
    "mahasiswaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "programStudi" TEXT NOT NULL,
    "tahunLulus" TEXT NOT NULL,
    "statusPekerjaan" TEXT NOT NULL,
    "masaTungguKerja" TEXT,
    "namaInstansi" TEXT,
    "jabatan" TEXT,
    "bidangPekerjaan" TEXT,
    "kesesuaianBidang" TEXT,
    "rangePenghasilan" TEXT,
    "saranUntukKampus" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracer_studies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "konten_karirs" (
    "id" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "penulis" TEXT,
    "namaInstansi" TEXT,
    "tipe" TEXT,
    "linkLamar" TEXT,
    "kategori" TEXT,
    "gaji" TEXT,
    "kuota" INTEGER,
    "deadline" TIMESTAMP(3),
    "thumbnail" TEXT,
    "scope" TEXT DEFAULT 'NASIONAL',
    "status" TEXT NOT NULL DEFAULT 'published',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "showOnHome" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "konten_karirs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survei_lulusans" (
    "id" TEXT NOT NULL,
    "mitraId" TEXT NOT NULL,
    "namaInstansi" TEXT NOT NULL,
    "alumniId" TEXT,
    "kualitasLulusan" INTEGER NOT NULL,
    "kemampuanTeknis" INTEGER NOT NULL,
    "kemampuanKomunikasi" INTEGER NOT NULL,
    "etikaKerja" INTEGER NOT NULL,
    "kemampuanKerjaTim" INTEGER NOT NULL,
    "saran" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survei_lulusans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mahasiswa_experiences" (
    "id" TEXT NOT NULL,
    "mahasiswaId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mahasiswa_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mahasiswa_certificates" (
    "id" TEXT NOT NULL,
    "mahasiswaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mahasiswa_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mahasiswa_qualifications" (
    "id" TEXT NOT NULL,
    "mahasiswaId" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "ipk" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mahasiswa_qualifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uploaded_documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mahasiswaId" TEXT,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "category" TEXT NOT NULL DEFAULT 'cv',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uploaded_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beritas" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "slug" TEXT,
    "body" TEXT NOT NULL,
    "thumbnail" TEXT,
    "penulis" TEXT,
    "kategori" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beritas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "komentar_beritas" (
    "id" TEXT NOT NULL,
    "beritaId" TEXT NOT NULL,
    "userId" TEXT,
    "nama" TEXT NOT NULL,
    "email" TEXT,
    "konten" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "komentar_beritas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengumumans" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "thumbnail" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengumumans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "galeri_items" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "kategori" TEXT,
    "deskripsi" TEXT,
    "tanggal" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "galeri_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kalender_kegiatans" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalSelesai" TIMESTAMP(3),
    "lokasi" TEXT,
    "kategori" TEXT,
    "warna" TEXT DEFAULT '#3B82F6',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kalender_kegiatans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_slides" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "subjudul" TEXT,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT,
    "linkLabel" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hero_slides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_fair_events" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalSelesai" TIMESTAMP(3),
    "lokasi" TEXT,
    "bannerUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_fair_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_fair_companies" (
    "id" TEXT NOT NULL,
    "jobFairId" TEXT NOT NULL,
    "namaInstansi" TEXT NOT NULL,
    "logoUrl" TEXT,
    "bidangIndustri" TEXT,
    "jumlahLowongan" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_fair_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campus_hirings" (
    "id" TEXT NOT NULL,
    "namaInstansi" TEXT NOT NULL,
    "logoUrl" TEXT,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "lokasi" TEXT,
    "deskripsi" TEXT,
    "linkDaftar" TEXT,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campus_hirings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mou_stakeholders" (
    "id" TEXT NOT NULL,
    "namaInstansi" TEXT NOT NULL,
    "logoUrl" TEXT,
    "jenisMou" TEXT,
    "tanggalMou" TIMESTAMP(3),
    "berlakuHingga" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mou_stakeholders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surat_keputusans" (
    "id" TEXT NOT NULL,
    "nomor" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "fileUrl" TEXT,
    "kategori" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "surat_keputusans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "laporan_kinerjas" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "periode" TEXT,
    "fileUrl" TEXT,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "laporan_kinerjas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anggota_tims" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "photoUrl" TEXT,
    "email" TEXT,
    "bio" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anggota_tims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "konseling_configs" (
    "id" TEXT NOT NULL,
    "deskripsi" TEXT,
    "kontakWa" TEXT,
    "email" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "konseling_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visi_misi_configs" (
    "id" TEXT NOT NULL,
    "visi" TEXT NOT NULL,
    "misi" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visi_misi_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_media_items" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_media_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_role" ON "users"("role");

-- CreateIndex
CREATE INDEX "idx_users_status" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswas_userId_key" ON "mahasiswas"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswas_nim_key" ON "mahasiswas"("nim");

-- CreateIndex
CREATE INDEX "idx_mahasiswas_angkatan" ON "mahasiswas"("angkatan");

-- CreateIndex
CREATE INDEX "idx_mahasiswas_nim" ON "mahasiswas"("nim");

-- CreateIndex
CREATE INDEX "idx_mahasiswas_prodi" ON "mahasiswas"("programStudi");

-- CreateIndex
CREATE UNIQUE INDEX "alumnis_userId_key" ON "alumnis"("userId");

-- CreateIndex
CREATE INDEX "idx_alumnis_prodi" ON "alumnis"("programStudi");

-- CreateIndex
CREATE INDEX "idx_alumnis_status_pekerjaan" ON "alumnis"("statusPekerjaan");

-- CreateIndex
CREATE INDEX "idx_alumnis_tahun_lulus" ON "alumnis"("tahunLulus");

-- CreateIndex
CREATE UNIQUE INDEX "mitras_userId_key" ON "mitras"("userId");

-- CreateIndex
CREATE INDEX "idx_lowongans_created_at" ON "lowongans"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_lowongans_deadline" ON "lowongans"("deadline");

-- CreateIndex
CREATE INDEX "idx_lowongans_mitra" ON "lowongans"("mitraId");

-- CreateIndex
CREATE INDEX "idx_lowongans_status" ON "lowongans"("status");

-- CreateIndex
CREATE INDEX "idx_lowongans_tipe" ON "lowongans"("tipe");

-- CreateIndex
CREATE INDEX "idx_pengajuan_lowongan" ON "pengajuan_magangs"("lowonganId");

-- CreateIndex
CREATE INDEX "idx_pengajuan_mahasiswa" ON "pengajuan_magangs"("mahasiswaId");

-- CreateIndex
CREATE INDEX "idx_pengajuan_status" ON "pengajuan_magangs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "beritas_slug_key" ON "beritas"("slug");

-- CreateIndex
CREATE INDEX "idx_beritas_created_at" ON "beritas"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_beritas_status" ON "beritas"("status");

-- AddForeignKey
ALTER TABLE "mahasiswas" ADD CONSTRAINT "mahasiswas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alumnis" ADD CONSTRAINT "alumnis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mitras" ADD CONSTRAINT "mitras_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lowongans" ADD CONSTRAINT "lowongans_mitraId_fkey" FOREIGN KEY ("mitraId") REFERENCES "mitras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_magangs" ADD CONSTRAINT "pengajuan_magangs_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "mahasiswas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_magangs" ADD CONSTRAINT "pengajuan_magangs_lowonganId_fkey" FOREIGN KEY ("lowonganId") REFERENCES "lowongans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracer_studies" ADD CONSTRAINT "tracer_studies_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "mahasiswas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survei_lulusans" ADD CONSTRAINT "survei_lulusans_mitraId_fkey" FOREIGN KEY ("mitraId") REFERENCES "mitras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survei_lulusans" ADD CONSTRAINT "survei_lulusans_alumniId_fkey" FOREIGN KEY ("alumniId") REFERENCES "alumnis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa_experiences" ADD CONSTRAINT "mahasiswa_experiences_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "mahasiswas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa_certificates" ADD CONSTRAINT "mahasiswa_certificates_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "mahasiswas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa_qualifications" ADD CONSTRAINT "mahasiswa_qualifications_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "mahasiswas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploaded_documents" ADD CONSTRAINT "uploaded_documents_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "mahasiswas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "komentar_beritas" ADD CONSTRAINT "komentar_beritas_beritaId_fkey" FOREIGN KEY ("beritaId") REFERENCES "beritas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_fair_companies" ADD CONSTRAINT "job_fair_companies_jobFairId_fkey" FOREIGN KEY ("jobFairId") REFERENCES "job_fair_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================-- CHECK constraints (TIDAK dikelola Prisma — lihat docs/arsip-supabase/005_add_checks.sql)
-- Prisma mengabaikan CHECK di `migrate diff`, jadi blok ini harus tetap ada di
-- sini. Tanpa ini, database server kampus kehilangan seluruh validasi data.
-- Sumber kebenaran: docs/arsip-supabase/005_add_checks.sql
-- ============================================================================

-- ── LANGKAH 0: bersihkan SEMUA varian case dari constraint ini ─────────────
-- Idempoten: nama target dihitung dari tabel + nama lowercase, jadi berapa pun
-- varian case yang pernah tercipta akan terhapus sebelum dipasang ulang.
DO $$
DECLARE
  t text;
  want text;
BEGIN
  FOR t, want IN
    SELECT * FROM (VALUES
      ('alumnis',             'alumnis_statuspekerjaan_check'),
      ('tracer_studies',      'tracer_studies_statuspekerjaan_check'),
      ('beritas',             'beritas_status_check'),
      ('pengumumans',         'pengumumans_status_check'),
      ('konten_karirs',       'konten_karirs_status_check'),
      ('konten_karirs',       'konten_karirs_jenis_check'),
      ('konten_karirs',       'konten_karirs_scope_check'),
      ('konten_karirs',       'konten_karirs_tipe_check'),
      ('lowongans',           'lowongans_jenispekerjaan_check'),
      ('lowongans',           'lowongans_sumber_check'),
      ('pengajuan_magangs',   'pengajuan_magangs_interviewmethod_check'),
      ('pengajuan_magangs',   'pengajuan_magangs_interviewstatus_check'),
      ('komentar_beritas',    'komentar_beritas_status_check'),
      ('campus_hirings',      'campus_hirings_status_check'),
      ('job_fair_events',     'job_fair_events_status_check'),
      ('mou_stakeholders',    'mou_stakeholders_status_check'),
      ('uploaded_documents',  'uploaded_documents_category_check'),
      ('survei_lulusans',     'survei_lulusans_kualitaslulusan_check'),
      ('survei_lulusans',     'survei_lulusans_kemampuanteknis_check'),
      ('survei_lulusans',     'survei_lulusans_kemampuankomunikasi_check'),
      ('survei_lulusans',     'survei_lulusans_etikakerja_check'),
      ('survei_lulusans',     'survei_lulusans_kemampuankerjatim_check')
    ) AS v(tbl, con)
  LOOP
    EXECUTE format(
      'ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', t, want);
    -- hapus juga varian camelCase apa pun (case-insensitive)
    PERFORM 1 FROM pg_constraint c
      JOIN pg_class r ON r.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = r.relnamespace
     WHERE n.nspname = 'public' AND c.contype = 'c'
       AND r.relname = t AND lower(c.conname) = want;
    IF FOUND THEN
      EXECUTE (
        SELECT format('ALTER TABLE %I DROP CONSTRAINT %I', t, c.conname)
        FROM pg_constraint c
        JOIN pg_class r ON r.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = r.relnamespace
        WHERE n.nspname = 'public' AND c.contype = 'c'
          AND r.relname = t AND lower(c.conname) = want
        LIMIT 1);
    END IF;
  END LOOP;
END $$;

-- ── alumni & tracer study: status pekerjaan (lowercase) ─────────────────────
ALTER TABLE alumnis ADD CONSTRAINT alumnis_statuspekerjaan_check
  CHECK ("statusPekerjaan" IN ('bekerja','wirausaha','lanjut_studi','belum_bekerja'));

ALTER TABLE tracer_studies ADD CONSTRAINT tracer_studies_statuspekerjaan_check
  CHECK ("statusPekerjaan" IN ('bekerja','wirausaha','lanjut_studi','belum_bekerja'));

-- ── konten: status artikel (lowercase) ─────────────────────────────────────
ALTER TABLE beritas ADD CONSTRAINT beritas_status_check
  CHECK (status IN ('draft','published','archived'));

ALTER TABLE pengumumans ADD CONSTRAINT pengumumans_status_check
  CHECK (status IN ('draft','published','archived'));

ALTER TABLE konten_karirs ADD CONSTRAINT konten_karirs_status_check
  CHECK (status IN ('draft','published','archived'));

-- ── konten_karir: enum jenis/scope/tipe ────────────────────────────────────
ALTER TABLE konten_karirs ADD CONSTRAINT konten_karirs_jenis_check
  CHECK (jenis IN ('berita','lowongan','program','pengumuman','workshop','softskill','seminar','presentasi','event'));

ALTER TABLE konten_karirs ADD CONSTRAINT konten_karirs_scope_check
  CHECK (scope IN ('LOKAL','REGIONAL','NASIONAL','GLOBAL'));

ALTER TABLE konten_karirs ADD CONSTRAINT konten_karirs_tipe_check
  CHECK (tipe IN ('magang','kerja'));

-- ── lowongan ───────────────────────────────────────────────────────────────
ALTER TABLE lowongans ADD CONSTRAINT lowongans_jenispekerjaan_check
  CHECK ("jenisPekerjaan" IN ('full-time','part-time','freelance','kontrak'));

ALTER TABLE lowongans ADD CONSTRAINT lowongans_sumber_check
  CHECK (sumber IN ('admin','mitra'));

-- ── pengajuan magang: status interview (lowercase) ─────────────────────────
ALTER TABLE pengajuan_magangs ADD CONSTRAINT pengajuan_magangs_interviewmethod_check
  CHECK ("interviewMethod" IN ('online','offline'));

ALTER TABLE pengajuan_magangs ADD CONSTRAINT pengajuan_magangs_interviewstatus_check
  CHECK ("interviewStatus" IN ('pending','scheduled','completed'));

-- ── komentar berita: status UPPERCASE (beda konvensi dari tabel lain) ──────
ALTER TABLE komentar_beritas ADD CONSTRAINT komentar_beritas_status_check
  CHECK (status IN ('PENDING','APPROVED','REJECTED','SPAM'));

-- ── event ──────────────────────────────────────────────────────────────────
ALTER TABLE campus_hirings ADD CONSTRAINT campus_hirings_status_check
  CHECK (status IN ('upcoming','ongoing','completed'));

ALTER TABLE job_fair_events ADD CONSTRAINT job_fair_events_status_check
  CHECK (status IN ('upcoming','ongoing','completed'));

-- ── MoU ────────────────────────────────────────────────────────────────────
ALTER TABLE mou_stakeholders ADD CONSTRAINT mou_stakeholders_status_check
  CHECK (status IN ('aktif','expired','dalam_proses'));

-- ── dokumen ────────────────────────────────────────────────────────────────
ALTER TABLE uploaded_documents ADD CONSTRAINT uploaded_documents_category_check
  CHECK (category IN ('cv','surat_pengantar','transkrip','ktp','lainnya'));

-- ── survei lulusan: skor 1..5 ──────────────────────────────────────────────
ALTER TABLE survei_lulusans ADD CONSTRAINT survei_lulusans_kualitaslulusan_check
  CHECK ("kualitasLulusan" >= 1 AND "kualitasLulusan" <= 5);

ALTER TABLE survei_lulusans ADD CONSTRAINT survei_lulusans_kemampuanteknis_check
  CHECK ("kemampuanTeknis" >= 1 AND "kemampuanTeknis" <= 5);

ALTER TABLE survei_lulusans ADD CONSTRAINT survei_lulusans_kemampuankomunikasi_check
  CHECK ("kemampuanKomunikasi" >= 1 AND "kemampuanKomunikasi" <= 5);

ALTER TABLE survei_lulusans ADD CONSTRAINT survei_lulusans_etikakerja_check
  CHECK ("etikaKerja" >= 1 AND "etikaKerja" <= 5);

ALTER TABLE survei_lulusans ADD CONSTRAINT survei_lulusans_kemampuankerjatim_check
  CHECK ("kemampuanKerjaTim" >= 1 AND "kemampuanKerjaTim" <= 5);
