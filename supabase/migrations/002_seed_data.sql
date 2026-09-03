-- ============================================================
-- Migration: 002_seed_data.sql
-- Portal CDC Universitas Muhammadiyah Kendari
-- Data awal / seed untuk development & testing
-- ============================================================

-- ============================================================
-- SEED: users
-- ============================================================

INSERT INTO "users" ("id", "name", "email", "password", "phone", "role", "status", "createdAt", "updatedAt") VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Operator CDC UM Kendari',       'admin@umkendari.ac.id',  '$2b$10$fmrK3i0NELYb7y9vnsgnkeG5kZ10y0iXwXz10.y2bL7pQ5n1m3k4j', '081234567890', 'ADMIN',  'ACTIVE',  '2026-01-10T08:00:00Z', NOW()),
  ('a1b2c3d4-0001-0001-0001-000000000002', 'Muhammad Fadly Alamsyah',        'mhs@umkendari.ac.id',    '$2b$10$fmrK3i0NELYb7y9vnsgnkeG5kZ10y0iXwXz10.y2bL7pQ5n1m3k4j', '085241009988', 'USER',   'ACTIVE',  '2026-02-15T09:30:00Z', NOW()),
  ('a1b2c3d4-0001-0001-0001-000000000003', 'Siti Rahmawati',                 'rahma@umkendari.ac.id',  '$2b$10$fmrK3i0NELYb7y9vnsgnkeG5kZ10y0iXwXz10.y2bL7pQ5n1m3k4j', '082199008811', 'USER',   'PENDING', '2026-06-01T10:15:00Z', NOW()),
  ('a1b2c3d4-0001-0001-0001-000000000004', 'Fachrul Alam Prasetyo, S.Kom.', 'alumni@umkendari.ac.id', '$2b$10$fmrK3i0NELYb7y9vnsgnkeG5kZ10y0iXwXz10.y2bL7pQ5n1m3k4j', '081122334455', 'USER',   'ACTIVE',  '2026-01-20T11:00:00Z', NOW()),
  ('a1b2c3d4-0001-0001-0001-000000000005', 'Andi Megawati, S.E.',            'mega@umkendari.ac.id',   '$2b$10$fmrK3i0NELYb7y9vnsgnkeG5kZ10y0iXwXz10.y2bL7pQ5n1m3k4j', '085311223344', 'USER',   'ACTIVE',  '2026-03-05T14:20:00Z', NOW()),
  ('a1b2c3d4-0001-0001-0001-000000000006', 'Budi Setiawan (HRD PT Go Digital)', 'mitra@umkendari.ac.id', '$2b$10$fmrK3i0NELYb7y9vnsgnkeG5kZ10y0iXwXz10.y2bL7pQ5n1m3k4j', '081299998888', 'MITRA', 'ACTIVE', '2026-02-10T10:00:00Z', NOW()),
  ('a1b2c3d4-0001-0001-0001-000000000007', 'Suhartono (BSI Kendari)',        'bsi@umkendari.ac.id',    '$2b$10$fmrK3i0NELYb7y9vnsgnkeG5kZ10y0iXwXz10.y2bL7pQ5n1m3k4j', '081377776666', 'MITRA',  'PENDING', '2026-05-28T09:00:00Z', NOW()),
  ('a1b2c3d4-0001-0001-0001-000000000008', 'Dr. H. Ruslan, M.Si.',           'viewer@umkendari.ac.id', '$2b$10$fmrK3i0NELYb7y9vnsgnkeG5kZ10y0iXwXz10.y2bL7pQ5n1m3k4j', '081144455566', 'VIEWER', 'ACTIVE',  '2026-01-15T09:00:00Z', NOW())
ON CONFLICT ("email") DO NOTHING;

-- ============================================================
-- SEED: mahasiswas
-- ============================================================

INSERT INTO "mahasiswas" ("id", "userId", "nim", "nama", "email", "phone", "programStudi", "fakultas", "angkatan", "semester", "alamat", "ipk", "skills", "createdAt", "updatedAt") VALUES
  (
    'b1b2c3d4-0002-0002-0002-000000000001',
    'a1b2c3d4-0001-0001-0001-000000000002',
    '202101001',
    'Muhammad Fadly Alamsyah',
    'mhs@umkendari.ac.id',
    '085241009988',
    'Teknik Informatika',
    'Fakultas Teknik',
    '2021',
    10,
    'Jl. K.H. Ahmad Dahlan No. 10, Kota Kendari, Sulawesi Tenggara',
    '3.85 / 4.00',
    ARRAY['JavaScript', 'React.js', 'UI/UX Design', 'Node.js', 'Python', 'Git & GitHub', 'HTML/CSS', 'Tailwind CSS'],
    NOW(), NOW()
  ),
  (
    'b1b2c3d4-0002-0002-0002-000000000002',
    'a1b2c3d4-0001-0001-0001-000000000003',
    '202302044',
    'Siti Rahmawati',
    'rahma@umkendari.ac.id',
    '082199008811',
    'Sistem Informasi',
    'Fakultas Teknik',
    '2023',
    6,
    'Jl. Jenderal Sudirman No. 45, Kendari',
    '3.72 / 4.00',
    ARRAY['Python', 'SQL', 'Data Analysis'],
    NOW(), NOW()
  )
ON CONFLICT ("nim") DO NOTHING;

-- ============================================================
-- SEED: alumnis
-- ============================================================

INSERT INTO "alumnis" ("id", "userId", "nim", "nama", "email", "phone", "programStudi", "fakultas", "tahunLulus", "statusPekerjaan", "instansiKerja", "jabatan", "createdAt", "updatedAt") VALUES
  (
    'c1b2c3d4-0003-0003-0003-000000000001',
    'a1b2c3d4-0001-0001-0001-000000000004',
    '202001045',
    'Fachrul Alam Prasetyo, S.Kom.',
    'alumni@umkendari.ac.id',
    '081122334455',
    'Teknik Informatika',
    'Fakultas Teknik',
    '2025',
    'bekerja',
    'PT Go Digital Kendari',
    'Web Developer',
    NOW(), NOW()
  ),
  (
    'c1b2c3d4-0003-0003-0003-000000000002',
    'a1b2c3d4-0001-0001-0001-000000000005',
    '202002102',
    'Andi Megawati, S.E.',
    'mega@umkendari.ac.id',
    '085311223344',
    'Manajemen',
    'Fakultas Ekonomi dan Bisnis Islam',
    '2024',
    'wirausaha',
    'Kopi Sultan Kendari',
    'Owner',
    NOW(), NOW()
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: mitras
-- ============================================================

INSERT INTO "mitras" ("id", "userId", "namaInstansi", "bidangIndustri", "alamat", "kontakPerson", "email", "phone", "website", "statusKerjaSama", "createdAt", "updatedAt") VALUES
  (
    'd1b2c3d4-0004-0004-0004-000000000001',
    'a1b2c3d4-0001-0001-0001-000000000006',
    'PT Go Digital Kendari',
    'Teknologi Informasi & Software',
    'Kawasan Bisnis Kendari Town Square (KTS) Lt. 2, Kendari',
    'Budi Setiawan',
    'mitra@umkendari.ac.id',
    '081299998888',
    'https://godigitalkendari.com',
    'AKTIF',
    NOW(), NOW()
  ),
  (
    'd1b2c3d4-0004-0004-0004-000000000002',
    'a1b2c3d4-0001-0001-0001-000000000007',
    'Bank Syariah Indonesia (BSI) Area Kendari',
    'Perbankan & Keuangan Syariah',
    'Jl. Abdullah Silondae No. 12, Kendari',
    'Suhartono',
    'bsi@umkendari.ac.id',
    '081377776666',
    'https://bankbsi.co.id',
    'PENDING',
    NOW(), NOW()
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: lowongans (4 lowongan sample)
-- ============================================================

INSERT INTO "lowongans" ("id", "mitraId", "createdBy", "judul", "tipe", "namaInstansi", "lokasi", "kategori", "gaji", "kuota", "deadline", "status", "deskripsi", "kualifikasi", "keahlian", "benefit", "createdAt", "updatedAt") VALUES
  (
    'e1b2c3d4-0005-0005-0005-000000000001',
    'd1b2c3d4-0004-0004-0004-000000000001',
    'a1b2c3d4-0001-0001-0001-000000000006',
    'Fullstack Web Developer Intern',
    'MAGANG',
    'PT Go Digital Kendari',
    'Kendari (Hybrid)',
    'TI / Perangkat Lunak',
    'Kompetitif',
    3,
    '2026-09-15T00:00:00Z',
    'PUBLISHED',
    'PT Go Digital Kendari mencari Mahasiswa Magang Fullstack Web Developer yang sangat termotivasi untuk bergabung dengan tim dinamis kami.',
    ARRAY['Mahasiswa semester 6 ke atas', 'Memahami React.js dan Node.js', 'Komunikatif dan bisa bekerja tim'],
    ARRAY['JavaScript', 'React.js', 'Node.js', 'Git', 'Problem Solving'],
    ARRAY['Uang saku bulanan', 'Sertifikat magang resmi', 'Mentorship dari senior developer', 'Peluang direkrut setelah lulus'],
    '2026-05-10T10:00:00Z', NOW()
  ),
  (
    'e1b2c3d4-0005-0005-0005-000000000002',
    'd1b2c3d4-0004-0004-0004-000000000001',
    'a1b2c3d4-0001-0001-0001-000000000006',
    'UI/UX Designer Intern',
    'MAGANG',
    'PT Go Digital Kendari',
    'Kendari (Hybrid)',
    'Desain Kreatif & Multimedia',
    'Kompetitif',
    2,
    '2026-09-20T00:00:00Z',
    'PUBLISHED',
    'Merancang antarmuka aplikasi mobile dan web berorientasi pengguna yang intuitif dan menarik.',
    ARRAY['Menguasai Figma atau Adobe XD', 'Memiliki portofolio desain UI dasar', 'Memahami Design System'],
    ARRAY['Figma', 'UI Design', 'Wireframing', 'Prototyping'],
    ARRAY['Uang saku bulanan', 'Sertifikat magang resmi', 'Portofolio berkualitas industri'],
    '2026-05-12T11:00:00Z', NOW()
  ),
  (
    'e1b2c3d4-0005-0005-0005-000000000003',
    'd1b2c3d4-0004-0004-0004-000000000001',
    'a1b2c3d4-0001-0001-0001-000000000006',
    'Junior Web Developer (Lulusan Baru)',
    'KERJA',
    'PT Go Digital Kendari',
    'Kendari (On-site)',
    'TI / Rekayasa Perangkat Lunak',
    'Rp 4.500.000 - Rp 6.000.000',
    2,
    '2026-09-30T00:00:00Z',
    'PUBLISHED',
    'Kami mencari lulusan baru (fresh graduate) dari alumni UM Kendari untuk bergabung dalam tim pengembang perangkat lunak.',
    ARRAY['Alumni UM Kendari', 'Memahami RESTful API dan SQL', 'IPK minimal 3.00'],
    ARRAY['JavaScript', 'React', 'Node.js', 'SQL'],
    ARRAY['Gaji pokok kompetitif', 'BPJS Kesehatan & Ketenagakerjaan', 'Bonus performa tahunan'],
    '2026-05-15T09:00:00Z', NOW()
  ),
  (
    'e1b2c3d4-0005-0005-0005-000000000004',
    NULL,
    'a1b2c3d4-0001-0001-0001-000000000001',
    'Junior Project Engineer',
    'KERJA',
    'PT RIASARANA ELECTRINDO',
    'Jakarta Barat, DKI JAKARTA',
    'Teknik/Rekayasa & Manufaktur',
    'Rp 6.000.000 - Rp 8.500.000',
    3,
    '2026-10-31T00:00:00Z',
    'PUBLISHED',
    'PT Riasarana Electrindo membuka lowongan Junior Project Engineer untuk perencanaan dan pengawasan proyek rekayasa elektrikal.',
    ARRAY['S1 Teknik Elektro/Industri/Mesin', 'IPK minimal 3.00', 'Memahami AutoCAD'],
    ARRAY['AutoCAD', 'Project Management', 'Electrical Engineering'],
    ARRAY['Gaji Pokok & Tunjangan Proyek', 'BPJS Kesehatan & Ketenagakerjaan', 'Pelatihan Sertifikasi'],
    '2026-06-01T08:00:00Z', NOW()
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: mahasiswa_experiences
-- ============================================================

INSERT INTO "mahasiswa_experiences" ("id", "mahasiswaId", "position", "company", "period", "description", "createdAt") VALUES
  (
    'f1b2c3d4-0006-0006-0006-000000000001',
    'b1b2c3d4-0002-0002-0002-000000000001',
    'Fullstack Web Developer Intern',
    'PT Go Digital Kendari',
    '2026 - Sekarang',
    'Mengembangkan dan memelihara aplikasi portal akademik kampus dan integrasi RESTful API backend.',
    NOW()
  ),
  (
    'f1b2c3d4-0006-0006-0006-000000000002',
    'b1b2c3d4-0002-0002-0002-000000000001',
    'Anggota Divisi IT & Komunikasi',
    'Himpunan Mahasiswa Teknik Informatika UMK',
    '2024 - 2025',
    'Mengelola situs web kegiatan mahasiswa dan publikasi digital kampus.',
    NOW()
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: mahasiswa_certificates
-- ============================================================

INSERT INTO "mahasiswa_certificates" ("id", "mahasiswaId", "name", "issuer", "year", "createdAt") VALUES
  (
    'g1b2c3d4-0007-0007-0007-000000000001',
    'b1b2c3d4-0002-0002-0002-000000000001',
    'Sertifikat Kompetensi Fullstack Web Developer - BNSP',
    'BNSP',
    '2025',
    NOW()
  ),
  (
    'g1b2c3d4-0007-0007-0007-000000000002',
    'b1b2c3d4-0002-0002-0002-000000000001',
    'Google IT Support Professional Certificate',
    'Google / Coursera',
    '2024',
    NOW()
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: mahasiswa_qualifications
-- ============================================================

INSERT INTO "mahasiswa_qualifications" ("id", "mahasiswaId", "institution", "level", "year", "ipk", "createdAt") VALUES
  (
    'h1b2c3d4-0008-0008-0008-000000000001',
    'b1b2c3d4-0002-0002-0002-000000000001',
    'UNIVERSITAS MUHAMMADIYAH KENDARI',
    'Sarjana (S1) - Teknik Informatika',
    '2026',
    '3.85 / 4.00',
    NOW()
  ),
  (
    'h1b2c3d4-0008-0008-0008-000000000002',
    'b1b2c3d4-0002-0002-0002-000000000001',
    'SMA Negeri 1 Kendari',
    'SMA - Jurusan IPA (Natural Sciences)',
    '2022',
    NULL,
    NOW()
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: beritas (berita sample)
-- ============================================================

INSERT INTO "beritas" ("id", "judul", "slug", "body", "penulis", "kategori", "status", "isPinned", "createdAt", "updatedAt") VALUES
  (
    'i1b2c3d4-0009-0009-0009-000000000001',
    'CDC UM Kendari Buka Layanan Konseling Karir Semester Genap 2026',
    'cdc-buka-konseling-karir-2026',
    'Career Development Center Universitas Muhammadiyah Kendari resmi membuka layanan konseling karir untuk semester genap 2026. Mahasiswa dan alumni dapat mendaftar melalui portal ini.',
    'Tim CDC UM Kendari',
    'Pengumuman',
    'published',
    TRUE,
    NOW(), NOW()
  ),
  (
    'i1b2c3d4-0009-0009-0009-000000000002',
    'Job Fair UM Kendari 2026: 50+ Perusahaan Siap Rekrut Lulusan',
    'job-fair-umk-2026',
    'UM Kendari kembali menggelar Job Fair tahunan yang akan diikuti oleh lebih dari 50 perusahaan nasional dan regional. Acara ini terbuka untuk mahasiswa semester akhir dan alumni.',
    'Tim CDC UM Kendari',
    'Event',
    'published',
    TRUE,
    NOW(), NOW()
  )
ON CONFLICT ("slug") DO NOTHING;

-- ============================================================
-- SEED: anggota_tims
-- ============================================================

INSERT INTO "anggota_tims" ("id", "nama", "jabatan", "urutan", "isActive", "createdAt") VALUES
  ('j1b2c3d4-0010-0010-0010-000000000001', 'Dr. H. Ahmad Rifai, M.Si.', 'Kepala CDC UM Kendari', 1, TRUE, NOW()),
  ('j1b2c3d4-0010-0010-0010-000000000002', 'Nurlaila, S.Pd., M.Pd.', 'Koordinator Pelayanan Karir', 2, TRUE, NOW()),
  ('j1b2c3d4-0010-0010-0010-000000000003', 'Baharuddin, S.Kom., M.T.', 'Koordinator Magang & Alumni', 3, TRUE, NOW()),
  ('j1b2c3d4-0010-0010-0010-000000000004', 'Sitti Hadijah, S.E.', 'Staf Administrasi', 4, TRUE, NOW())
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: hero_slides
-- ============================================================

INSERT INTO "hero_slides" ("id", "judul", "subjudul", "imageUrl", "linkUrl", "linkLabel", "urutan", "isActive", "createdAt") VALUES
  (
    'k1b2c3d4-0011-0011-0011-000000000001',
    'Selamat Datang di Portal CDC UM Kendari',
    'Temukan peluang magang, karir, dan pengembangan diri terbaik untuk mahasiswa dan alumni',
    '/images/hero-1.jpg',
    '/lowongan',
    'Lihat Lowongan',
    1,
    TRUE,
    NOW()
  ),
  (
    'k1b2c3d4-0011-0011-0011-000000000002',
    'Job Fair UM Kendari 2026',
    'Bergabung dengan 50+ perusahaan nasional yang siap merekrut lulusan terbaik UM Kendari',
    '/images/hero-2.jpg',
    '/event/job-fair',
    'Daftar Sekarang',
    2,
    TRUE,
    NOW()
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: visi_misi_configs
-- ============================================================

INSERT INTO "visi_misi_configs" ("id", "visi", "misi", "updatedAt") VALUES
  (
    'l1b2c3d4-0012-0012-0012-000000000001',
    'Menjadi pusat pengembangan karir terdepan yang menghubungkan mahasiswa dan alumni UM Kendari dengan dunia industri dan profesional.',
    ARRAY[
      'Memfasilitasi mahasiswa dan alumni dalam mengembangkan kompetensi dan kesiapan karir',
      'Membangun jejaring kuat antara perguruan tinggi dengan dunia industri dan stakeholder',
      'Menyediakan layanan informasi lowongan kerja, magang, dan pengembangan karir secara terintegrasi',
      'Melaksanakan tracer study secara berkala untuk meningkatkan kualitas lulusan UM Kendari',
      'Menyelenggarakan kegiatan career development center yang inovatif dan relevan dengan kebutuhan industri'
    ],
    NOW()
  )
ON CONFLICT DO NOTHING;
