-- ============================================================================
-- Migration 004: Netralkan RLS Supabase sebelum migrasi ke server kampus
-- ============================================================================
--
-- JANGAN dijalankan di Supabase kecuali memang akan migrasi.
-- File ini disiapkan untuk dipakai saat pindah ke PostgreSQL server kampus.
--
-- ----------------------------------------------------------------------------
-- KENAPA INI PERLU
-- ----------------------------------------------------------------------------
-- Tiga tabel memakai FORCE ROW LEVEL SECURITY + policy berbasis auth.uid():
--     pengajuan_magangs, tracer_studies, uploaded_documents
--
-- auth.uid() adalah fungsi khusus Supabase (schema `auth`) yang membaca klaim
-- JWT dari PostgREST. Di PostgreSQL biasa (server kampus) fungsi itu TIDAK ADA.
--
-- Selain itu, predikatnya:
--     USING (auth.uid()::text = "userId")
-- Jika auth.uid() bernilai NULL, ekspresinya menjadi NULL (bukan TRUE), sehingga
-- SEMUA baris terfilter keluar.
--
-- KONDISI SAAT INI (Supabase): RLS tampak "aman" dan tidak mengganggu karena
-- role `postgres` yang dipakai Prisma punya atribut BYPASSRLS=true, sehingga RLS
-- dilewati sepenuhnya. Policy ini praktis dekoratif.
--
-- RISIKO SAAT PINDAH KE KAMPUS: bila admin database kampus membuat user
-- aplikasi TANPA BYPASSRLS (praktik yang benar dan lazim), maka:
--   - mahasiswa mengajukan magang  -> tersimpan tapi TIDAK PERNAH terlihat
--   - tracer study                 -> selalu kosong
--   - upload dokumen               -> hilang dari daftar
-- Gejalanya menyesatkan ("sepertinya belum ada yang apply"), padahal data masuk.
--
-- ----------------------------------------------------------------------------
-- KENAPA AMAN DIHAPUS
-- ----------------------------------------------------------------------------
-- Policy ini TIDAK sedang memberi perlindungan apa pun (bypassrls=true).
-- Batas keamanan sesungguhnya berada di lapisan Express:
--   server.js -> authenticateToken (JWT) + TABLE_TO_MODEL whitelist + zod
--
-- TRADE-OFF YANG DISADARI: menghapus RLS berarti kehilangan defense-in-depth di
-- level database. Semua otorisasi bergantung pada kode aplikasi. Karena itu
-- role aplikasi di server kampus harus diberi hak MINIMAL (hanya tabel yang
-- dibutuhkan) dan JWT_SECRET wajib diganti dengan yang baru.
--
-- ----------------------------------------------------------------------------
-- JIKA INGIN MEMPERTAHANKAN RLS (alternatif)
-- ----------------------------------------------------------------------------
-- Jika kehilangan defense-in-depth tidak dapat diterima, JANGAN pakai file ini.
-- Sebagai gantinya, ganti setiap `auth.uid()` dengan variabel sesi sendiri:
--     ALTER TABLE pengajuan_magangs FORCE ROW LEVEL SECURITY;
--     -- ubah policy agar memakai:
--     current_setting('app.current_user_id', true)
--   lalu di server.js, set per-request di dalam transaksi:
--     SET LOCAL app.current_user_id = '<id dari JWT>';
-- Ini lebih aman tetapi menuntut setiap query berjalan dalam transaksi yang
-- menyetel variabel tersebut. Beban perawatan jauh lebih tinggi.
-- ============================================================================


-- ── LANGKAH 1: hapus semua policy di schema public ──────────────────────────
-- Dihasilkan langsung dari pg_policies agar tidak ada yang terlewat.

DROP POLICY IF EXISTS "Service role akses penuh alumnis" ON public.alumnis;
DROP POLICY IF EXISTS "Publik dapat membaca anggota tim" ON public.anggota_tims;
DROP POLICY IF EXISTS "Service role akses penuh anggota_tims" ON public.anggota_tims;
DROP POLICY IF EXISTS "Publik dapat membaca berita published" ON public.beritas;
DROP POLICY IF EXISTS "Service role akses penuh beritas" ON public.beritas;
DROP POLICY IF EXISTS "Publik dapat membaca campus hiring" ON public.campus_hirings;
DROP POLICY IF EXISTS "Service role akses penuh campus_hirings" ON public.campus_hirings;
DROP POLICY IF EXISTS "Publik dapat membaca galeri" ON public.galeri_items;
DROP POLICY IF EXISTS "Service role akses penuh galeri_items" ON public.galeri_items;
DROP POLICY IF EXISTS "Publik dapat membaca hero slides" ON public.hero_slides;
DROP POLICY IF EXISTS "Service role akses penuh hero_slides" ON public.hero_slides;
DROP POLICY IF EXISTS "Service role akses penuh job_fair_companies" ON public.job_fair_companies;
DROP POLICY IF EXISTS "Publik dapat membaca job fair" ON public.job_fair_events;
DROP POLICY IF EXISTS "Service role akses penuh job_fair_events" ON public.job_fair_events;
DROP POLICY IF EXISTS "Service role akses penuh kalender_kegiatans" ON public.kalender_kegiatans;
DROP POLICY IF EXISTS "Service role akses penuh komentar_beritas" ON public.komentar_beritas;
DROP POLICY IF EXISTS "Publik dapat membaca konten karir published" ON public.konten_karirs;
DROP POLICY IF EXISTS "Service role akses penuh konten_karirs" ON public.konten_karirs;
DROP POLICY IF EXISTS "Service role akses penuh laporan_kinerjas" ON public.laporan_kinerjas;
DROP POLICY IF EXISTS "Publik dapat membaca lowongan published" ON public.lowongans;
DROP POLICY IF EXISTS "Service role akses penuh lowongans" ON public.lowongans;
DROP POLICY IF EXISTS "Service role akses penuh mahasiswa_certificates" ON public.mahasiswa_certificates;
DROP POLICY IF EXISTS "Service role akses penuh mahasiswa_experiences" ON public.mahasiswa_experiences;
DROP POLICY IF EXISTS "Service role akses penuh mahasiswa_qualifications" ON public.mahasiswa_qualifications;
DROP POLICY IF EXISTS "Service role akses penuh mahasiswas" ON public.mahasiswas;
DROP POLICY IF EXISTS "Service role akses penuh mitras" ON public.mitras;
DROP POLICY IF EXISTS "Service role akses penuh mou_stakeholders" ON public.mou_stakeholders;
DROP POLICY IF EXISTS "Service role akses penuh pengajuan" ON public.pengajuan_magangs;
DROP POLICY IF EXISTS rls_mahasiswa_baca_pengajuan_sendiri ON public.pengajuan_magangs;
DROP POLICY IF EXISTS rls_service_role_pengajuan_full ON public.pengajuan_magangs;
DROP POLICY IF EXISTS "Publik dapat membaca pengumuman published" ON public.pengumumans;
DROP POLICY IF EXISTS "Service role akses penuh pengumumans" ON public.pengumumans;
DROP POLICY IF EXISTS "Service role akses penuh surat_keputusans" ON public.surat_keputusans;
DROP POLICY IF EXISTS "Service role akses penuh survei" ON public.survei_lulusans;
DROP POLICY IF EXISTS "Service role akses penuh tracer study" ON public.tracer_studies;
DROP POLICY IF EXISTS rls_user_baca_tracer_study_sendiri ON public.tracer_studies;
DROP POLICY IF EXISTS "Service role akses penuh uploaded_documents" ON public.uploaded_documents;
DROP POLICY IF EXISTS rls_user_baca_dokumen_sendiri ON public.uploaded_documents;
DROP POLICY IF EXISTS "Service role akses penuh users" ON public.users;

-- ── LANGKAH 2: matikan RLS & FORCE RLS di semua tabel ──────────────────────

ALTER TABLE public.alumnis                 DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.anggota_tims            DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.beritas                 DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_hirings          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.galeri_items            DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides             DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_fair_companies      DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_fair_events         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.kalender_kegiatans      DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.komentar_beritas        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.konten_karirs           DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.laporan_kinerjas        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lowongans               DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mahasiswa_certificates  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mahasiswa_experiences   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mahasiswa_qualifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mahasiswas              DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mitras                   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mou_stakeholders        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengajuan_magangs       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengumumans             DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.surat_keputusans        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.survei_lulusans         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracer_studies          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_documents      DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users                   DISABLE ROW LEVEL SECURITY;

-- FORCE RLS ini yang paling berbahaya: membuat RLS tetap berlaku bahkan bagi
-- pemilik tabel. Inilah yang akan membutakan aplikasi di server kampus.
ALTER TABLE public.pengajuan_magangs       NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public.tracer_studies          NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_documents      NO FORCE ROW LEVEL SECURITY;


-- ── LANGKAH 3: VERIFIKASI (harus mengembalikan 0 baris) ────────────────────
-- Jalankan setelah migrasi. Ketiga query HARUS menghasilkan nol baris.
--
--   SELECT relname FROM pg_class
--    WHERE relnamespace='public'::regnamespace AND relkind='r' AND relrowsecurity;
--
--   SELECT relname FROM pg_class
--    WHERE relnamespace='public'::regnamespace AND relkind='r' AND relforcerowsecurity;
--
--   SELECT tablename, policyname FROM pg_policies WHERE schemaname='public';
