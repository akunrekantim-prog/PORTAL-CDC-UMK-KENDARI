# 📚 PANDUAN LENGKAP SEMUA TABEL DATABASE & KONEKSINYA
## Portal CDC Universitas Muhammadiyah Kendari (UM Kendari)

Dokumen ini menjelaskan **satu per satu seluruh tabel** di database Supabase PostgreSQL, **fungsinya**, **kolom kunci**, **relasi ke tabel lain**, **siapa yang mengaksesnya**, dan **alur data** dari frontend → backend → database.

Sumber skema: `prisma/schema.prisma` (model) + `supabase/migrations/001_create_all_tables.sql` (DDL) + `supabase/migrations/002_seed_data.sql` (data awal).

---

## 🧭 PEMETAAN CEPAT (27 Tabel Inti)

| # | Tabel | Kategori | Fungsi Singkat | Relasi (FK) |
|---|-------|----------|----------------|-------------|
| 1 | `users` | Master | Akun semua pengguna | parent ke mahasiswas, alumnis, mitras |
| 2 | `mahasiswas` | Profil | Profil detail mahasiswa | userId → users |
| 3 | `alumnis` | Profil | Profil alumni | userId → users |
| 4 | `mitras` | Profil | Profil instansi/partner | userId → users |
| 5 | `lowongans` | Karir | Lowongan magang & kerja | mitraId → mitras, createdBy → users |
| 6 | `pengajuan_magangs` | Karir | Lamaran magang/kerja | mahasiswaId, lowonganId, mitraId |
| 7 | `tracer_studies` | Karir | Survei karir lulusan | mahasiswaId → mahasiswas |
| 8 | `konten_karirs` | Konten | Artikel/event konten | (createdBy reference) |
| 9 | `beritas` | Konten | Berita portal | id → komentar_beritas |
| 10 | `komentar_beritas` | Konten | Komentar berita | beritaId → beritas, userId → users |
| 11 | `pengumumans` | Konten | Pengumuman resmi | — |
| 12 | `galeri_items` | Konten | Galeri foto | — |
| 13 | `kalender_kegiatans` | Konten | Jadwal kegiatan | — |
| 14 | `hero_slides` | Konten | Banner beranda | — |
| 15 | `job_fair_events` | Event | Event job fair | id → job_fair_companies |
| 16 | `job_fair_companies` | Event | Perusahaan peserta job fair | jobFairId → job_fair_events |
| 17 | `campus_hirings` | Event | Campus hiring | — |
| 18 | `mou_stakeholders` | Konten | MOU/kerjasama | — |
| 19 | `surat_keputusans` | Konten | Surat keputusan | — |
| 20 | `laporan_kinerjas` | Konten | Laporan kinerja | — |
| 21 | `anggota_tims` | Konten | Tim pengurus CDC | — |
| 22 | `konseling_configs` | Konfig | Konfigurasi konseling | — |
| 23 | `visi_misi_configs` | Konfig | Visi & misi | — |
| 24 | `social_media_items` | Konfig | Link sosmed | — |
| 25 | `uploaded_documents` | Dokumen | File upload mahasiswa | userId → users, mahasiswaId → mahasiswas |
| 26 | `mahasiswa_experiences` | Profil anak | Pengalaman kerja | mahasiswaId → mahasiswas |
| 27 | `mahasiswa_certificates` | Profil anak | Sertifikat | mahasiswaId → mahasiswas |
| 28 | `mahasiswa_qualifications` | Profil anak | Riwayat pendidikan | mahasiswaId → mahasiswas |
| 29 | `survei_lulusans` | Karir | Survei kepuasan mitra | mitraId → mitras, alumniId → alumnis |

> Catatan: Ada `konseling_configs` yang tidak punya model Prisma (ditolak aman di endpoint DELETE).
> `beritas` sebenarnya adalah subset konten dari `konten_karirs` jenis `berita`.

---

## 🔍 PENJELASAN DETAIL SATU PER SATU

### 1️⃣ `users` — Tabel MASTER Akun Pengguna
- **Fungsi:** Menyimpan akun semua pengguna portal: Admin CDC, Mahasiswa, Alumni, Mitra, Viewer.
- **Kolom kunci:** `id` (UUID PK), `email` (unik), `password` (hash Bcrypt), `role` (enum), `status` (enum PENDING/ACTIVE/INACTIVE/REJECTED), `lastLoginAt`.
- **Terhubung ke:**
  - 👉 1:1 → `mahasiswas` (via `userId`)
  - 👉 1:1 → `alumnis` (via `userId`)
  - 👉 1:1 → `mitras` (via `userId`)
  - 👉 1:N → `lowongans` (via `createdBy`)
  - 👉 1:N → `pengajuan_magangs` (via `userId`)
  - 👉 1:N → `tracer_studies` (via `userId`)
  - 👉 1:N → `komentar_beritas` (via `userId`)
  - 👉 1:N → `uploaded_documents` (via `userId`)
  - 👉 1:N → `konten_karirs` (via `createdBy` reference)
- **Diakses oleh:** `Login.tsx`, `Register.tsx`, `App.tsx` `/api/login`, `AdminDashboard`, `server.js /api/sync/users`.
- **Alur:** Register → `registerUser()` membuat row di `users` + `mahasiswas`/`alumnis`/`mitras` → login via `POST /api/login` verifikasi bcrypt → JWT disimpan di `localStorage`.

---

### 2️⃣ `mahasiswas` — Profil Detail Mahasiswa Aktif
- **Fungsi:** Data lengkap mahasiswa: NIM, nama, prodi, fakultas, angkatan, semester, IPK, skills, CV.
- **Kolom kunci:** `id`, `userId` (FK UNIQUE → users), `nim` (unik), `programStudi`, `fakultas`, `angkatan`, `ipk`, `skills[]`.
- **Terhubung ke:**
  - 👉 N:1 → `users` (userId)
  - 👉 1:N → `pengajuan_magangs` (mahasiswaId)
  - 👉 1:N → `tracer_studies` (mahasiswaId)
  - 👉 1:N → `mahasiswa_experiences` / `mahasiswa_certificates` / `mahasiswa_qualifications` (cascade)
  - 👉 1:N → `uploaded_documents` (mahasiswaId)
- **Diakses oleh:** `MahasiswaDashboard`, `StudentProfileView`, `AdminDashboard` (verifikasi), `server.js /api/sync/mahasiswa`.

---

### 3️⃣ `alumnis` — Profil Alumni UM Kendari
- **Fungsi:** Data alumni yang sudah lulus: tahun lulus, status pekerjaan, instansi kerja, jabatan.
- **Kolom kunci:** `id`, `userId` (FK UNIQUE), `tahunLulus`, `statusPekerjaan` (check constraint), `instansiKerja`.
- **Terhubung ke:**
  - 👉 N:1 → `users`
  - 👉 1:N → `survei_lulusans` (alumniId, SET NULL)
- **Diakses oleh:** `TracerStudyForm` (alumni isi), `AdminDashboard`, `server.js /api/sync/alumni`.

---

### 4️⃣ `mitras` — Profil Instansi / Perusahaan Mitra
- **Fungsi:** Data perusahaan/instansi yang bekerja sama dengan CDC: nama instansi, bidang industri, kontak person, website, status kerjasama.
- **Kolom kunci:** `id`, `userId` (FK UNIQUE), `namaInstansi`, `kontakPerson`, `statusKerjaSama` (AKTIF/NONAKTIF/PENDING).
- **Terhubung ke:**
  - 👉 N:1 → `users`
  - 👉 1:N → `lowongans` (mitraId, SET NULL)
  - 👉 1:N → `pengajuan_magangs` (mitraId, SET NULL)
  - 👉 1:N → `survei_lulusans` (mitraId, CASCADE)
- **Diakses oleh:** `MitraDashboard`, `AdminDashboard`, `server.js /api/sync/mitra`.

---

### 5️⃣ `lowongans` — Daftar Lowongan Magang & Kerja
- **Fungsi:** Postingan lowongan dari mitra/admin: judul, tipe (magang/kerja), instansi, deskripsi, kualifikasi, benefit, deadline, status.
- **Kolom kunci:** `id`, `mitraId` (FK), `createdBy`, `judul`, `tipe`, `lokasi`, `deadline`, `status` (DRAFT/PUBLISHED/CLOSED/ARCHIVED).
- **Terhubung ke:**
  - 👉 N:1 → `mitras` (mitraId)
  - 👉 N:1 → `users` (createdBy)
  - 👉 1:N → `pengajuan_magangs` (lowonganId, SET NULL)
- **Diakses oleh:** `PublicLayout` (daftar published), `JobDetail`, `MahasiswaDashboard`, `MitraDashboard` (lowongan mitra sendiri), `AdminDashboard` (kelola semua), `server.js /api/sync/lowongan`.

---

### 6️⃣ `pengajuan_magangs` — Lamaran Mahasiswa (Core Workflow)
- **Fungsi:** Menyimpan seluruh lamaran/ajuan mahasiswa ke lowongan, plus data interview & seleksi multi-tahap.
- **Kolom kunci:** `id`, `mahasiswaId` (FK), `userId`, `lowonganId` (FK), `mitraId` (FK), `status` (SUBMITTED → SELEKSI_ADMINISTRASI → INTERVIEW → DITERIMA/DITOLAK), `interviewStatus`, `interviewDate`, `interviewMethod`.
- **Terhubung ke:**
  - 👉 N:1 → `mahasiswas` (CASCADE)
  - 👉 N:1 → `users` (userId)
  - 👉 N:1 → `lowongans` (SET NULL)
  - 👉 N:1 → `mitras` (SET NULL)
- **Diakses oleh:** `StudentApplicationsView`, `AdminDashboard` (kelola status), `MitraDashboard` (lihat pelamar), `server.js /api/sync/pengajuan_magang`.
- **Alur:** Mahasiswa apply → insert `pengajuan_magangs` status SUBMITTED → Admin review → interview schedule → DITERIMA/DITOLAK → ONGOING → COMPLETED.

---

### 7️⃣ `tracer_studies` — Survei Karir Lulusan
- **Fungsi:** Data hasil tracer study: status pekerjaan, masa tunggu kerja, instansi, jabatan, rentang penghasilan, saran untuk kampus.
- **Kolom kunci:** `id`, `mahasiswaId` (FK CASCADE), `userId`, `tahunLulus`, `statusPekerjaan`, `rangePenghasilan`.
- **Terhubung ke:**
  - 👉 N:1 → `mahasiswas` (mahasiswaId)
  - 👉 N:1 → `users` (userId reference)
- **Diakses oleh:** `TracerStudyForm`, `AdminDashboard`, `server.js /api/sync/tracer_study`.

---

### 8️⃣ `konten_karirs` — Konten Artikel & Event Layanan
- **Fungsi:** Konten dinamis dengan `jenis` (berita, lowongan, program, pengumuman, workshop, softskill, seminar, presentasi). Ini adalah **tabel super** yang menampung berita, program, dan event layanan sekaligus.
- **Kolom kunci:** `id`, `jenis`, `judul`, `body`, `status` (draft/published/archived), `scope` (LOKAL/REGIONAL/NASIONAL/GLOBAL), `isPinned`, `showOnHome`, `thumbnail`.
- **Terhubung ke:**
  - 👉 reference → `users` (createdBy, createdByName)
  - 👉 dipetakan ke model `Berita` di frontend saat `jenis='berita'` (via `mapKontenBeritaToBerita`)
- **Diakses oleh:** `PublicLayout`, `BeritaDetailView`, `AdminDashboard` (CRUD), `server.js /api/sync/konten_karir`.

---

### 9️⃣ `beritas` — Berita Portal CDC
- **Fungsi:** Berita resmi portal (bisa berasal dari seed lokal maupun konten_karir jenis berita).
- **Kolom kunci:** `id`, `judul`, `slug` (unik), `body`, `status`, `viewCount`.
- **Terhubung ke:**
  - 👉 1:N → `komentar_beritas` (beritaId, CASCADE)
- **Diakses oleh:** `PublicLayout`, `BeritaDetailView`, `AdminDashboard`.

---

### 🔟 `komentar_beritas` — Komentar pada Berita
- **Fungsi:** Menyimpan komentar publik dengan moderasi (status PENDING/APPROVED/REJECTED/SPAM).
- **Kolom kunci:** `id`, `beritaId` (FK CASCADE), `userId` (FK SET NULL), `nama`, `email`, `konten`, `status`.
- **Terhubung ke:**
  - 👉 N:1 → `beritas` (CASCADE)
  - 👉 N:1 → `users` (SET NULL)
- **Diakses oleh:** `BeritaDetailView`, `data.ts` insert/update komentar.

---

### 1️⃣1️⃣ `pengumumans` — Pengumuman Resmi CDC
- **Fungsi:** Pengumuman dari admin (draft → published → archived).
- **Kolom:** `id`, `judul`, `body`, `thumbnail`, `isPinned`, `status`.
- **Terhubung ke:** Tidak ada FK.
- **Diakses oleh:** `PublicLayout`, halaman Pengumuman, `AdminDashboard`.

---

### 1️⃣2️⃣ `galeri_items` — Galeri Foto Kegiatan
- **Fungsi:** Dokumentasi foto kegiatan CDC (kategori, deskripsi, tanggal).
- **Kolom:** `id`, `judul`, `imageUrl`, `kategori`, `deskripsi`, `tanggal`.
- **Terhubung ke:** Tidak ada FK.
- **Diakses oleh:** `GaleriView`, `AdminDashboard`.

---

### 1️⃣3️⃣ `kalender_kegiatans` — Kalender Kegiatan
- **Fungsi:** Jadwal kegiatan CDC dengan rentang tanggal, lokasi, kategori, warna.
- **Kolom:** `id`, `judul`, `tanggalMulai`, `tanggalSelesai`, `lokasi`, `kategori`, `warna`.
- **Terhubung ke:** Tidak ada FK.
- **Diakses oleh:** `KalenderKegiatanView`, `AdminDashboard`.

---

### 1️⃣4️⃣ `hero_slides` — Slide Banner Beranda
- **Fungsi:** Carousel banner hero di halaman utama (judul, subjudul, gambar, link, urutan, isActive).
- **Kolom:** `id`, `judul`, `subjudul`, `imageUrl`, `linkUrl`, `urutan`, `isActive`.
- **Terhubung ke:** Tidak ada FK.
- **Diakses oleh:** `HeroSlider`, `PublicLayout`.

---

### 1️⃣5️⃣ `job_fair_events` — Event Job Fair
- **Fungsi:** Event job fair yang diselenggarakan CDC (judul, deskripsi, tanggal, lokasi, banner, status).
- **Terhubung ke:**
  - 👉 1:N → `job_fair_companies` (jobFairId, CASCADE)
- **Diakses oleh:** `CareerFair`, `EventCardLayout`.

---

### 1️⃣6️⃣ `job_fair_companies` — Perusahaan Peserta Job Fair
- **Fungsi:** Daftar perusahaan peserta per event job fair (logo, bidang industri, jumlah lowongan).
- **Terhubung ke:**
  - 👉 N:1 → `job_fair_events` (CASCADE)
- **Diakses oleh:** `CareerFair`.

---

### 1️⃣7️⃣ `campus_hirings` — Program Campus Hiring
- **Fungsi:** Informasi campus hiring dari perusahaan (nama instansi, tanggal, lokasi, deskripsi, link daftar, status).
- **Terhubung ke:** Tidak ada FK.
- **Diakses oleh:** `CampusHiring`.

---

### 1️⃣8️⃣ `mou_stakeholders` — MOU / Kerjasama Stakeholder
- **Fungsi:** Data perjanjian kerjasama (nama instansi, logo, jenis MOU, tanggal berlaku, status aktif/expired/dalam_proses).
- **Terhubung ke:** Tidak ada FK.
- **Diakses oleh:** `MouStakeholderView`.

---

### 1️⃣9️⃣ `surat_keputusans` — Surat Keputusan Resmi
- **Fungsi:** Dokumen SK resmi (nomor, judul, tanggal, fileUrl, kategori).
- **Terhubung ke:** Tidak ada FK.
- **Diakses oleh:** `SuratKeputusanView`.

---

### 2️⃣0️⃣ `laporan_kinerjas` — Laporan Kinerja Tahunan
- **Fungsi:** Laporan kinerja & aktivitas CDC (judul, tahun, periode, fileUrl, deskripsi).
- **Terhubung ke:** Tidak ada FK.
- **Diakses oleh:** `LaporanKinerjaView`.

---

### 2️⃣1️⃣ `anggota_tims` — Tim Pengurus CDC
- **Fungsi:** Data pengurus/anggota tim (nama, jabatan, foto, email, bio, urutan, isActive).
- **Terhubung ke:** Tidak ada FK.
- **Diakses oleh:** Halaman Tim/Tentang Kami, `AdminDashboard`.

---

### 2️⃣2️⃣ `konseling_configs` — Konfigurasi Layanan Konseling
- **Fungsi:** Kontak & deskripsi layanan konseling karir (kontakWa, email).
- **Terhubung ke:** Tidak ada FK (**tidak ada model Prisma** → ditolak aman di endpoint DELETE).
- **Diakses oleh:** Halaman Konseling (data mungkin dari file/static).

---

### 2️⃣3️⃣ `visi_misi_configs` — Visi & Misi CDC
- **Fungsi:** Konten visi & misi untuk section "Tentang Kami" (visi, array misi).
- **Terhubung ke:** Tidak ada FK.
- **Diakses oleh:** Beranda publik (Tentang Kami).

---

### 2️⃣4️⃣ `social_media_items` — Link Media Sosial
- **Fungsi:** Daftar platform sosmed CDC (facebook, instagram, youtube, tiktok, dsb) + URL + status aktif.
- **Terhubung ke:** Tidak ada FK.
- **Diakses oleh:** `Footer`, `PublicLayout`.

---

### 2️⃣5️⃣ `uploaded_documents` — File Upload Mahasiswa
- **Fungsi:** Metadata dokumen yang diupload (CV, surat pengantar, transkrip, KTP) — fileUrl, fileType, fileSize, category.
- **Terhubung ke:**
  - 👉 N:1 → `users` (userId)
  - 👉 N:1 → `mahasiswas` (mahasiswaId, CASCADE)
- **Diakses oleh:** `StudentProfileView`, `AdminDashboard`.

---

### 2️⃣6️⃣ `mahasiswa_experiences` — Pengalaman Kerja Mahasiswa
- **Fungsi:** Riwayat pengalaman kerja/magang per mahasiswa (posisi, perusahaan, periode, deskripsi).
- **Terhubung ke:**
  - 👉 N:1 → `mahasiswas` (CASCADE)
- **Diakses oleh:** `StudentProfileView`, `MahasiswaDashboard`.

---

### 2️⃣7️⃣ `mahasiswa_certificates` — Sertifikat Mahasiswa
- **Fungsi:** Sertifikat & penghargaan (nama, penerbit, tahun, fileUrl).
- **Terhubung ke:**
  - 👉 N:1 → `mahasiswas` (CASCADE)
- **Diakses oleh:** `StudentProfileView`, `MahasiswaDashboard`.

---

### 2️⃣8️⃣ `mahasiswa_qualifications` — Riwayat Pendidikan Mahasiswa
- **Fungsi:** Riwayat pendidikan formal (institusi, level, tahun, IPK).
- **Terhubung ke:**
  - 👉 N:1 → `mahasiswas` (CASCADE)
- **Diakses oleh:** `StudentProfileView`, `MahasiswaDashboard`.

---

### 2️⃣9️⃣ `survei_lulusans` — Survei Kepuasan Mitra terhadap Alumni
- **Fungsi:** Rating mitra terhadap kualitas lulusan (kualitas umum, teknis, komunikasi, etika kerja, teamwork — skala 1-5) + saran.
- **Terhubung ke:**
  - 👉 N:1 → `mitras` (CASCADE)
  - 👉 N:1 → `alumnis` (SET NULL)
- **Diakses oleh:** `MitraDashboard`, `AdminDashboard` (laporan).

---

## 🔄 ALUR DATA LENGKAP (Frontend → Backend → Database)

### Alur 1: Aplikasi & Data
```
App.tsx useEffect
  └─ initializeDB()
      └─ fetchInitialDatabaseFromSupabase()
          └─ GET http://localhost:5000/api/all-data
              └─ server.js (authenticateToken → apiLimiter)
                  └─ prisma.user.findMany() + semua model
                      └─ Supabase PostgreSQL (26+ tabel)
  └─ Jika gagal → fallback ke localStorage/MEMORY_DB
  └─ reloadDatabase() → isi React state (allLowongan, allBerita, ...)
```

### Alur 2: CRUD via `saveToDB` (auto-sync)
```
Component → insertToDB/updateInDB/deleteInDB
  └─ saveToDB(key, data) → MEMORY_DB[key] = data
      └─ setTimeout(async) → syncXxxToSupabase(item)
          └─ POST /api/sync/:entity (BUTUH JWT)
              └─ server.js → prisma.upsert → Supabase PostgreSQL
```

### Alur 3: Login
```
Login.tsx (client-check) vs App.tsx (backend /api/login)
  └─ POST http://localhost:5000/api/login (rate limit 5/15min)
      └─ findUnique email → cek status (PENDING/INACTIVE/REJECTED)
      └─ bcrypt.compare(password, hash)
      └─ JWT sign {id, email, role} 24h
      └─ localStorage: cdc_auth_token, cdc_token_expiry, cdc_session_id
      └─ Route ke dashboard sesuai role
```

### Alur 4: Delete
```
deleteInDB(key, id) → DELETE /api/:table/:id (BUTUH JWT)
  └─ whitelist ALLOWED_DELETE_TABLES (mapping ke Prisma model)
  └─ prisma[modelName].deleteMany({ where: { id } }) — parameterized
```

---

## 🛡️ RINGKASAN KEAMANAN DATABASE

| Aspek | Status |
|---|---|
| RLS aktif di semua 26+ tabel | ✅ Ya |
| Public SELECT policy (published content) | ✅ Ya (lowongan, berita, pengumuman, konten) |
| Public SELECT tanpa filter | ⚠️ Ya (galeri_items, job_fair_events, campus_hirings) |
| Service Role full access | ⚠️ Ya (USING TRUE — wajar untuk backend, tapi anon key **tidak boleh** punya akses ini) |
| Password hashing | ✅ Bcrypt `$2b$` (cost 10-12) |
| Password di localStorage | ⚠️ Berisiko: `data.ts` seed menyimpan `password: ''` string kosong; `Login.tsx` membandingkan plaintext |
| Trigger auto-update updatedAt | ✅ 11 tabel |
| Index performa | ✅ 17+ index |

---

## 📌 REKOMENDASI PERBAIKAN (PRIORITAS)

1. **URGENT**: Hapus field `password` dari `login` flow lokal `Login.tsx` — harus lewat backend `/api/login` saja.
2. **URGENT**: Nonaktifkan `#aistudio-role-switcher` + fallback admin sintetis di production.
3. **HIGH**: Supabase RLS — buat policy per-user ID untuk `pengajuan_magangs`, `tracer_studies`, `uploaded_documents`.
4. **MEDIUM**: Jangan ekspos `password` (string kosong/hash) ke `localStorage` — pindahkan ke backend session.
5. **LOW**: Hapus `SUPABASE_SERVICE_ROLE_KEY` dari `.env.example` jika tidak dipakai langsung oleh frontend (server-only).