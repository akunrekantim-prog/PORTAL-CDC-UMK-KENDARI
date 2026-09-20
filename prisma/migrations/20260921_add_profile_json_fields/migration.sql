-- Migration: Tambah field profil tambahan dan JSON columns ke tabel mahasiswas
-- Tanggal: 2026-09-21
-- Tujuan: Perbaikan cross-device sync Bug #1 (foto base64) & Bug #2 (field tidak disync)

-- Tambah field profil tambahan
ALTER TABLE "mahasiswas"
  ADD COLUMN IF NOT EXISTS "userStatusType" TEXT,
  ADD COLUMN IF NOT EXISTS "university" TEXT,
  ADD COLUMN IF NOT EXISTS "gender" TEXT,
  ADD COLUMN IF NOT EXISTS "workRights" TEXT,
  ADD COLUMN IF NOT EXISTS "nationality" TEXT,
  ADD COLUMN IF NOT EXISTS "opportunityType" TEXT,
  ADD COLUMN IF NOT EXISTS "preferredStartDate" TEXT,
  ADD COLUMN IF NOT EXISTS "industries" TEXT,
  ADD COLUMN IF NOT EXISTS "locations" TEXT,
  ADD COLUMN IF NOT EXISTS "graduationYear" TEXT;

-- Tambah kolom JSON untuk experiences, certificates, languages, qualifications
-- (cross-device sync tanpa perlu join ke tabel relasi)
ALTER TABLE "mahasiswas"
  ADD COLUMN IF NOT EXISTS "experiences" JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "certificates" JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "languages" JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "qualifications" JSONB DEFAULT '[]'::jsonb;
