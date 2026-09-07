-- Migration: Tambahkan RLS Policy untuk Mahasiswa & Mitra
-- Hanya jalankan di Supabase Database!

-- 1. Pengajuan Magang: Hanya bisa dilihat oleh pemilik (mahasiswa/mitra)
ALTER TABLE pengajuan_magangs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mahasiswa hanya baca pengajuan sendiri"
    ON pengajuan_magangs FOR SELECT
    USING (auth.uid()::text = mahasiswa_id::text);

CREATE POLICY "Mitra hanya baca pengajuan ke perusahaannya"
    ON pengajuan_magangs FOR SELECT
    USING (auth.uid()::text = mitra_id::text);

-- 2. Tracer Study: Hanya bisa dibaca oleh mahasiswa pembuatnya
ALTER TABLE tracer_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mahasiswa hanya baca tracer study sendiri"
    ON tracer_studies FOR SELECT
    USING (auth.uid()::text = mahasiswa_id::text);

-- 3. Dokumen Upload: Hanya bisa dibaca pemilik
ALTER TABLE uploaded_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User hanya baca dokumen sendiri"
    ON uploaded_documents FOR SELECT
    USING (auth.uid()::text = user_id::text);
