# 🗄️ Panduan Database - Portal CDC UM Kendari

Panduan lengkap untuk setup, migrasi, dan pengelolaan database PostgreSQL via Supabase dan Docker.

## 📁 Struktur File Database

```
PORTAL-CDC-UMK-KENDARI/
├── .env                              # Konfigurasi aktif (jangan di-commit ke git!)
├── .env.example                      # Template env (aman di-commit)
├── docker-compose.yml                # Setup PostgreSQL lokal via Docker
├── prisma/
│   └── schema.prisma                 # Skema Prisma ORM (sumber kebenaran)
└── supabase/
    └── migrations/
        ├── 001_create_all_tables.sql  # Migrasi utama: semua tabel
        └── 002_seed_data.sql          # Data awal/testing
```

---

## 🏛️ Struktur Tabel Database

### Tabel Inti (Core)
| Tabel | Keterangan |
|-------|------------|
| `users` | Akun semua pengguna (admin, mahasiswa, alumni, mitra) |
| `mahasiswas` | Profil detail mahasiswa aktif UM Kendari |
| `alumnis` | Profil alumni yang sudah lulus |
| `mitras` | Profil instansi/perusahaan mitra CDC |
| `lowongans` | Lowongan magang dan kerja |
| `pengajuan_magangs` | Pengajuan lamaran dari mahasiswa |
| `tracer_studies` | Data tracer study lulusan |
| `survei_lulusans` | Survei kepuasan mitra terhadap lulusan |
| `konten_karirs` | Artikel berita, pengumuman, info karir |

### Tabel Pendukung Mahasiswa
| Tabel | Keterangan |
|-------|------------|
| `mahasiswa_experiences` | Riwayat pengalaman kerja/magang |
| `mahasiswa_certificates` | Sertifikat dan penghargaan |
| `mahasiswa_qualifications` | Riwayat pendidikan |
| `uploaded_documents` | Dokumen upload (CV, surat, dll) |

### Tabel Konten Portal
| Tabel | Keterangan |
|-------|------------|
| `beritas` | Berita dan artikel portal |
| `komentar_beritas` | Komentar pada berita |
| `pengumumans` | Pengumuman resmi CDC |
| `galeri_items` | Galeri foto kegiatan |
| `kalender_kegiatans` | Jadwal kegiatan CDC |
| `hero_slides` | Slide banner halaman utama |
| `job_fair_events` | Event job fair |
| `job_fair_companies` | Perusahaan peserta job fair |
| `campus_hirings` | Program campus hiring |
| `mou_stakeholders` | Data MOU/kerjasama |
| `surat_keputusans` | Surat keputusan resmi |
| `laporan_kinerjas` | Laporan kinerja CDC |

### Tabel Konfigurasi
| Tabel | Keterangan |
|-------|------------|
| `anggota_tims` | Data pengurus/anggota tim CDC |
| `konseling_configs` | Konfigurasi layanan konseling |
| `visi_misi_configs` | Konfigurasi visi dan misi CDC |
| `social_media_items` | Link media sosial |

---

## 🚀 Cara Menjalankan

### Opsi 1: Langsung ke Supabase (Sudah Terhubung ✅)

Database sudah tersinkronisasi dengan Supabase menggunakan Prisma.

```bash
# Sinkronisasi schema ke Supabase
npx prisma db push

# Jalankan SQL migrasi kustom (tabel tambahan + seed)
# Buka Supabase Dashboard → SQL Editor → paste isi file:
# supabase/migrations/001_create_all_tables.sql
# supabase/migrations/002_seed_data.sql
```

### Opsi 2: Local Development dengan Docker

```bash
# 1. Jalankan PostgreSQL lokal
docker-compose up -d

# 2. Ganti DATABASE_URL di .env ke lokal:
# DATABASE_URL="postgresql://cdcadmin:cdcumk2026@localhost:5433/portal_cdc"

# 3. Jalankan migrasi Prisma
npx prisma migrate dev --name init

# 4. Akses GUI database di:
# http://localhost:8080 (Adminer)
# Server: db | User: cdcadmin | Password: cdcumk2026 | DB: portal_cdc

# 5. Hentikan Docker
docker-compose down
```

---

## 🔧 Perintah Prisma yang Berguna

```bash
# Push schema ke database (development)
npx prisma db push

# Buat migrasi baru (production-ready)
npx prisma migrate dev --name nama_migrasi

# Terapkan migrasi ke production
npx prisma migrate deploy

# Buka Prisma Studio (GUI)
npx prisma studio

# Generate Prisma Client setelah update schema
npx prisma generate

# Introspect database yang sudah ada
npx prisma db pull

# Reset database (HATI-HATI: hapus semua data!)
npx prisma migrate reset
```

---

## 📌 Cara Menjalankan SQL di Supabase Dashboard

1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project **Portal CDC UM Kendari**
3. Klik **SQL Editor** di sidebar kiri
4. Klik **New Query**
5. Copy-paste isi file `supabase/migrations/001_create_all_tables.sql`
6. Klik **Run** (▶)
7. Ulangi untuk `002_seed_data.sql` jika ingin data awal

---

## 🔒 Keamanan

- **Row Level Security (RLS)** aktif di semua tabel
- Konten publik (lowongan published, berita, dll) dapat dibaca tanpa login
- Data pribadi (mahasiswa, alumni, pengajuan) hanya bisa diakses via **service role** (backend)
- Jangan pernah expose `SUPABASE_SERVICE_ROLE_KEY` di frontend!

---

## 🐳 Docker Compose Services

| Service | Port | Akses |
|---------|------|-------|
| PostgreSQL | `5433` | `postgresql://cdcadmin:cdcumk2026@localhost:5433/portal_cdc` |
| Adminer (GUI) | `8080` | http://localhost:8080 |
