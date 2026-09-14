-- ============================================================================
-- Migration 005: CHECK constraints eksplisit
-- ============================================================================
--
-- KENAPA FILE INI ADA
-- -------------------
-- Prisma TIDAK BISA mengekspresikan CHECK constraint di schema.prisma, dan
-- `prisma migrate diff` mengabaikannya sepenuhnya (melaporkan "empty migration"
-- walau constraint ada di DB). Akibatnya 22 CHECK yang dipasang manual di DB
-- TIDAK ikut tercatat di prisma/migrations/0_init/migration.sql.
--
-- Kalau dibiarkan, saat migrasi ke server kampus `prisma migrate deploy` akan
-- membuat tabel TANPA satu pun CHECK — seluruh validasi data hilang tanpa jejak:
--   - status/enum dengan nilai case berbeda
--   - rentang skor survei 1..5
--   - kategori dokumen, metode interview, dst.
--
-- File ini adalah sumber kebenaran CHECK. Kalau menambah/mengubah CHECK, ubah
-- di sini DAN di prisma/migrations/0_init/migration.sql.
--
-- ⚠️ JEBAKAN CASE-SENSITIF (sudah pernah menggigit di sini)
-- Nama constraint asli memakai camelCase (mis. `alumnis_statusPekerjaan_check`).
-- PostgreSQL menurunkan identifier TANPA KUTIP menjadi lowercase, sehingga
-- `DROP CONSTRAINT IF EXISTS alumnis_statusPekerjaan_check` mencari
-- `alumnis_statuspekerjaan_check` dan TIDAK menemukan yang asli — hasilnya
-- CONSTRAINT DUPLIKAT (10 buah tercipta diam-diam saat pertama kali dicoba).
-- Karena itu blok pembersih di bawah memakai perbandingan lower(...) = lower(...).
--
-- Aman dijalankan: diverifikasi 0 baris data melanggar (2026-09-14).
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
  CHECK (jenis IN ('berita','lowongan','program','pengumuman','workshop','softskill','seminar','presentasi'));

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

-- ── VERIFIKASI (harus 22, tanpa duplikat) ──────────────────────────────────
--   SELECT count(*) FROM pg_constraint c
--   JOIN pg_class r ON r.oid = c.conrelid
--   JOIN pg_namespace n ON n.oid = r.relnamespace
--   WHERE n.nspname='public' AND c.contype='c';
--
--   -- tidak boleh ada duplikat per (tabel, lower(nama)):
--   SELECT r.relname, lower(c.conname), count(*) FROM pg_constraint c
--   JOIN pg_class r ON r.oid = c.conrelid
--   JOIN pg_namespace n ON n.oid = r.relnamespace
--   WHERE n.nspname='public' AND c.contype='c'
--   GROUP BY 1,2 HAVING count(*) > 1;
