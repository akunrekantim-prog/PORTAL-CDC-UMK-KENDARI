# 🗄️ ER Diagram & Alur Database — Portal CDC UM Kendari

## 📊 Overview Arsitektur

Portal CDC UM Kendari menggunakan **hybrid architecture**:
- **Frontend**: React 19 + TypeScript (Vite, port 3000)
- **Backend API**: Express.js + Prisma ORM (port 5000)
- **Database**: Supabase PostgreSQL (RLS aktif)
- **Local Cache**: localStorage (offline fallback)

```
┌──────────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER (React + Vite)                  │
│                        Port 3000                                  │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  Login   │ │Dashboard │ │ Mitra    │ │ Admin    │          │
│  │  Register│ │Mahasiswa │ │Dashboard │ │Dashboard │          │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘          │
│       │             │            │             │                 │
│  ┌────▼─────────────▼────────────▼─────────────▼──────┐        │
│  │           src/data.ts (Data Engine)                 │        │
│  │  - initializeDB() → fetch from Supabase/API         │        │
│  │  - getFromDB() / saveToDB() → localStorage          │        │
│  │  - syncXxxToSupabase() → POST /api/sync/:entity    │        │
│  └────────────────────┬────────────────────────────────┘        │
│                       │                                         │
│  ┌────────────────────▼────────────────────────────────┐        │
│  │         src/services/dbService.ts                   │        │
│  │  - fetchInitialDatabaseFromSupabase()               │        │
│  │  - syncUser/Mahasiswa/Alumni/Mitra/Lowongan/etc()   │        │
│  │  - deleteFromSupabase()                             │        │
│  └────────────────────┬────────────────────────────────┘        │
│                       │                                         │
│  ┌────────────────────▼────────────────────────────────┐        │
│  │            src/supabaseClient.ts                    │        │
│  │         createClient(SUPABASE_URL, ANON_KEY)        │        │
│  └────────────────────┬────────────────────────────────┘        │
└───────────────────────┼─────────────────────────────────────────┘
                        │
          ┌─────────────┼─────────────────┐
          │ Path 1      │ Path 2          │ Path 3
          │ (Direct)    │ (Express API)   │ (Fallback)
          │ Supabase JS │ JWT + Bcrypt    │ localStorage
          │             │ Prisma ORM      │
┌─────────▼───┐  ┌─────▼──────────┐  ┌───▼────────────┐
│ Supabase   │  │ Express.js     │  │  localStorage  │
│ Client     │  │ server.js      │  │  (Browser)     │
│ @supabase/ │  │ + Prisma       │  │  cdc_users     │
│ supabase-js│  │                │  │  cdc_lowongan  │
└─────┬──────┘  └──────┬─────────┘  └────────────────┘
      │                │
      │ Prisma         │
      │ Client         │
      │                │
┌─────▼────────────────▼──────────────────────────┐
│          Supabase PostgreSQL Database             │
│         (RLS Policies + Row Level Security)       │
│                                                  │
│  ┌────────────────────────────────────────────┐   │
│  │              26 TABLES                      │   │
│  │  ┌─────────┐ ┌──────────┐ ┌─────────────┐ │   │
│  │  │ users   │ │mahasiswas│ │  alumnis    │ │   │
│  │  │(MASTER) │ │(PROFILE) │ │ (PROFILE)   │ │   │
│  │  └────┬────┘ └────┬─────┘ └──────┬──────┘ │   │
│  │       │           │               │        │   │
│  │  ┌────▼───────────▼───────────────▼──────┐  │   │
│  │  │     MITRAS (Company Partners)          │  │   │
│  │  └────┬──────────────┬───────────────────┘  │   │
│  │       │              │                       │   │
│  │  ┌────▼──────┐ ┌─────▼──────────┐           │   │
│  │  │ LOWONGANS │ │TRACER_STUDIES  │           │   │
│  │  │(JOBS)     │ │(ALUMNI SURVEY) │           │   │
│  │  └────┬──────┘ └────────────────┘           │   │
│  │       │                                     │   │
│  │  ┌────▼────────────────────┐                │   │
│  │  │  PENGAJUAN_MAGANG       │◄─── Mahasiswa  │   │
│  │  │  (APPLICATIONS)         │               │   │
│  │  └─────────────────────────┘                │   │
│  │                                             │   │
│  │  ┌─────────────────────────────────────┐    │   │
│  │  │ KONTEN_KARIRS (Articles/Events)     │    │   │
│  │  │  ├─ Berita                         │    │   │
│  │  │  ├─ Lowongan                       │    │   │
│  │  │  ├─ Workshop/Softskill/Seminar     │    │   │
│  │  │  └─ Program/Pengumuman             │    │   │
│  │  └─────────────────────────────────────┘    │   │
│  │                                             │   │
│  │  ┌─────────────────────────────────────┐    │   │
│  │  │ PORTAL CONTENT TABLES               │    │   │
│  │  │  ├─ Berita + Komentar               │    │   │
│  │  │  ├─ Pengumuman                      │    │   │
│  │  │  ├─ Galeri, Kalender                │    │   │
│  │  │  ├─ HeroSlide, JobFair              │    │   │
│  │  │  ├─ CampusHiring, MOU               │    │   │
│  │  │  ├─ SuratKeputusan, Laporan         │    │   │
│  │  │  ├─ AnggotaTim, SocialMedia         │    │   │
│  │  │  ├─ VisiMisi, KonselingConfig       │    │   │
│  │  └─────────────────────────────────────┘    │   │
│  │                                             │   │
│  │  ┌─────────────────────────────────────┐    │   │
│  │  │ SUPPORTING TABLES                   │    │   │
│  │  │  ├─ MahasiswaExperience             │    │   │
│  │  │  ├─ MahasiswaCertificate            │    │   │
│  │  │  ├─ MahasiswaQualification          │    │   │
│  │  │  ├─ UploadedDocument                │    │   │
│  │  │  ├─ SurveiLulusan                   │    │   │
│  │  │  ├─ JobFairCompany                  │    │   │
│  │  │  └─ KomentarBerita                  │    │   │
│  │  └─────────────────────────────────────┘    │   │
│  └────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

---

## 🔗 RELATIONSHIP DIAGRAM (Mermaid ER)

```mermaid
erDiagram
    %% ============================================================
    %% MASTER USER TABLE - Root entity
    %% ============================================================
    users {
        uuid id PK "default(uuid())"
        string name NOT NULL
        string email UNIQUE NOT NULL
        string password "hashed (bcrypt)"
        string phone
        UserRole role @default(MAHASISWA)
        UserStatus status @default(PENDING)
        string photoUrl
        datetime lastLoginAt
        datetime createdAt
        datetime updatedAt
    }

    %% ============================================================
    %% PROFILE TABLES (1:1 with users)
    %% ============================================================
    users ||--|| mahasiswas : "userId → ONE-TO-ONE"
    users ||--|| alumnis : "userId → ONE-TO-ONE"
    users ||--|| mitras : "userId → ONE-TO-ONE"

    mahasiswas {
        uuid id PK
        uuid userId UNIQUE FK "users.id CASCADE"
        string nim UNIQUE NOT NULL
        string nama NOT NULL
        string email NOT NULL
        string phone
        string programStudi
        string fakultas
        string angkatan
        int semester @default(1)
        string alamat
        string aboutMe
        string ipk
        string[] skills
        string cvName
    }

    alumnis {
        uuid id PK
        uuid userId UNIQUE FK "users.id CASCADE"
        string nim
        string nama NOT NULL
        string email NOT NULL
        string phone
        string programStudi
        string fakultas
        string tahunLulus
        string statusPekerjaan
        string instansiKerja
        string jabatan
    }

    mitras {
        uuid id PK
        uuid userId UNIQUE FK "users.id CASCADE"
        string namaInstansi NOT NULL
        string bidangIndustri
        string alamat
        string kontakPerson NOT NULL
        string email NOT NULL
        string phone
        string website
        string logoUrl
        string deskripsi
        StatusKerjasama statusKerjaSama @default(PENDING)
    }

    %% ============================================================
    %% CORE BUSINESS TABLES
    %% ============================================================
    mitras ||--o{ lowongans : "mitraId → 1:N LOWONGAN"
    users ||--o{ lowongans : "createdBy → 1:N LOWONGAN"

    lowongans {
        uuid id PK
        uuid mitraId FK "mitras.id SET NULL"
        uuid createdBy FK "users.id"
        string judul NOT NULL
        TipeLowongan tipe @default(KERJA)
        string namaInstansi NOT NULL
        string companyLogo
        string bannerImage
        string imageUrl
        string flyer
        string[] flyers
        string sumber @default("admin")
        string linkEksternal
        string jenisPekerjaan
        boolean isPinned @default(false)
        string lokasi NOT NULL
        string deskripsi
        string[] kualifikasi
        string[] tanggungJawab
        string[] keahlian
        string kategori
        string gaji
        string[] benefit
        int kuota
        datetime deadline NOT NULL
        StatusLowongan status @default(PUBLISHED)
    }

    lowongans ||--o{ pengajuan_magangs : "lowonganId → 1:N PENGAJUAN"
    mahasiswas ||--o{ pengajuan_magangs : "mahasiswaId → 1:N PENGAJUAN"
    mitras ||--o{ pengajuan_magangs : "mitraId → 1:N PENGAJUAN"

    pengajuan_magangs {
        uuid id PK
        uuid mahasiswaId FK "mahasiswas.id CASCADE"
        uuid userId FK "users.id"
        uuid lowonganId FK "lowongans.id SET NULL"
        uuid mitraId FK "mitras.id SET NULL"
        string namaInstansi
        string namaMahasiswa NOT NULL
        string nim NOT NULL
        string programStudi NOT NULL
        string tujuanMagang NOT NULL
        string lokasiMagang
        string catatan
        string berkasUrl
        string berkasNama
        datetime tanggalMulai
        datetime tanggalSelesai
        StatusPengajuan status @default(SUBMITTED)
        string catatanAdmin
        string interviewStatus
        datetime interviewDate
        string interviewTime
        string interviewMethod
        string interviewLink
        string interviewLocation
    }

    %% ============================================================
    %% TRACER STUDY (Alumni Survey)
    %% ============================================================
    mahasiswas ||--o{ tracer_studies : "mahasiswaId → 1:N"
    alumni ||--o{ survei_lulusans : "alumniId → 1:N"
    mitras ||--o{ survei_lulusans : "mitraId → 1:N"

    tracer_studies {
        uuid id PK
        uuid mahasiswaId FK "mahasiswas.id CASCADE"
        uuid userId FK "users.id"
        string nama
        string programStudi
        string tahunLulus
        string statusPekerjaan
        string masaTungguKerja
        string namaInstansi
        string jabatan
        string bidangPekerjaan
        string kesesuaianBidang
        string rangePenghasilan
        string saranUntukKampus
        datetime submittedAt
    }

    survei_lulusans {
        uuid id PK
        uuid mitraId FK "mitras.id CASCADE"
        string namaInstansi NOT NULL
        uuid alumniId FK "alumnis.id SET NULL"
        int kualitasLulusan 1-5
        int kemampuanTeknis 1-5
        int kemampuanKomunikasi 1-5
        int etikaKerja 1-5
        int kemampuanKerjaTim 1-5
        string saran
        datetime submittedAt
    }

    %% ============================================================
    %% CONTENT TABLES (Articles, Events, Info)
    %% ============================================================
    users ||--o{ konten_karirs : "createdBy reference"
    konten_karirs ||--o{ beritas : "via jenis='berita'"

    konten_karirs {
        uuid id PK
        string jenis CHECK(berita/lowongan/program/etc)
        string judul NOT NULL
        text body NOT NULL
        string penulis
        string namaInstansi
        string tipe
        string linkLamar
        string kategori
        string gaji
        int kuota
        datetime deadline
        string thumbnail
        string scope @default("NASIONAL")
        string status @default("published")
        boolean isPinned
        boolean showOnHome
    }

    %% ============================================================
    %% PORTAL CONTENT TABLES
    %% ============================================================
    beritas ||--o{ komentar_beritas : "beritaId → 1:N KOMENTAR"
    users ||--o{ komentar_beritas : "userId SET NULL"

    beritas {
        uuid id PK
        string judul
        string slug UNIQUE
        text body
        string thumbnail
        string penulis
        string kategori
        string[] tags
        boolean isPinned
        string status @default("draft")
        int viewCount @default(0)
    }

    komentar_beritas {
        uuid id PK
        uuid beritaId FK "beritas.id CASCADE"
        uuid userId FK "users.id SET NULL"
        string nama
        string email
        string konten NOT NULL
        string status @default("PENDING")
    }

    pengumumans {
        uuid id PK
        string judul NOT NULL
        text body NOT NULL
        string thumbnail
        boolean isPinned
        string status @default("draft")
    }

    galeri_items {
        uuid id PK
        string judul NOT NULL
        string imageUrl NOT NULL
        string kategori
        string deskripsi
        date tanggal
    }

    kalender_kegiatans {
        uuid id PK
        string judul NOT NULL
        string deskripsi
        datetime tanggalMulai NOT NULL
        datetime tanggalSelesai
        string lokasi
        string kategori
        string warna @default("#3B82F6")
    }

    hero_slides {
        uuid id PK
        string judul NOT NULL
        string subjudul
        string imageUrl NOT NULL
        string linkUrl
        string linkLabel
        int urutan @default(0)
        boolean isActive @default(true)
    }

    %% ============================================================
    %% JOB FAIR TABLES
    %% ============================================================
    job_fair_events ||--o{ job_fair_companies : "jobFairId → 1:N"

    job_fair_events {
        uuid id PK
        string judul NOT NULL
        string deskripsi
        datetime tanggalMulai NOT NULL
        datetime tanggalSelesai
        string lokasi
        string bannerUrl
        string status @default("upcoming")
    }

    job_fair_companies {
        uuid id PK
        uuid jobFairId FK "job_fair_events.id CASCADE"
        string namaInstansi NOT NULL
        string logoUrl
        string bidangIndustri
        int jumlahLowongan @default(0)
    }

    campus_hirings {
        uuid id PK
        string namaInstansi NOT NULL
        string logoUrl
        datetime tanggal NOT NULL
        string lokasi
        string deskripsi
        string linkDaftar
        string status @default("upcoming")
    }

    %% ============================================================
    %% MOU & KONFIRMASI TABLES
    %% ============================================================
    mou_stakeholders {
        uuid id PK
        string namaInstansi NOT NULL
        string logoUrl
        string jenisMou
        date tanggalMou
        date berlakuHingga
        string status @default("aktif")
    }

    surat_keputusans {
        uuid id PK
        string nomor NOT NULL
        string judul NOT NULL
        date tanggal NOT NULL
        string fileUrl
        string kategori
    }

    laporan_kinerjas {
        uuid id PK
        string judul NOT NULL
        int tahun NOT NULL
        string periode
        string fileUrl
        string deskripsi
    }

    %% ============================================================
    %% CONFIGURATION TABLES
    %% ============================================================
    anggota_tims {
        uuid id PK
        string nama NOT NULL
        string jabatan NOT NULL
        string photoUrl
        string email
        string bio
        int urutan @default(0)
        boolean isActive @default(true)
    }

    konseling_configs {
        uuid id PK
        string deskripsi
        string kontakWa
        string email
    }

    visi_misi_configs {
        uuid id PK
        string visi NOT NULL
        string[] misi
    }

    social_media_items {
        uuid id PK
        string platform
        string url
        string icon
        boolean isActive @default(true)
    }

    %% ============================================================
    %% SUPPORTING TABLES (Mahasiswa Documents)
    %% ============================================================
    mahasiswas ||--o{ mahasiswa_experiences : "mahasiswaId → CASCADE"
    mahasiswas ||--o{ mahasiswa_certificates : "mahasiswaId → CASCADE"
    mahasiswas ||--o{ mahasiswa_qualifications : "mahasiswaId → CASCADE"
    users ||--o{ uploaded_documents : "userId"
    mahasiswas ||--o{ uploaded_documents : "mahasiswaId"

    mahasiswa_experiences {
        uuid id PK
        uuid mahasiswaId FK "mahasiswas.id CASCADE"
        string position NOT NULL
        string company NOT NULL
        string period NOT NULL
        string description
    }

    mahasiswa_certificates {
        uuid id PK
        uuid mahasiswaId FK "mahasiswas.id CASCADE"
        string name NOT NULL
        string issuer NOT NULL
        string year NOT NULL
        string fileUrl
    }

    mahasiswa_qualifications {
        uuid id PK
        uuid mahasiswaId FK "mahasiswas.id CASCADE"
        string institution NOT NULL
        string level NOT NULL
        string year NOT NULL
        string ipk
    }

    uploaded_documents {
        uuid id PK
        uuid userId FK "users.id"
        uuid mahasiswaId FK "mahasiswas.id CASCADE"
        string fileName NOT NULL
        string fileUrl NOT NULL
        string fileType NOT NULL
        int fileSize
        string category @default("cv")
    }
```

---

## 🔄 ALUR DATA — STEP BY STEP

### 1. ALUR LOGIN (Autentikasi)

```
┌─────────────────────────────────────────────────────┐
│  USER INPUT: Email + Password                        │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  FRONTEND: Login.tsx                                │
│  1. getFromDB('users') → localStorage cache         │
│  2. Validasi lokal (email ada, password cocok)      │
│  NOTE: Client-side compare PLAINTEXT (BUG!)         │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  API CALL: POST /api/login                          │
│  ─────────────────────────────────────────────────  │
│  Headers: Content-Type: application/json            │
│  Body: { email, password }                          │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  BACKEND: server.js /api/login                      │
│  1. Rate limit check (max 5/15min)                  │
│  2. Prisma: findUnique({ email })                   │
│  3. Check user.status (PENDING/INACTIVE/REJECTED)   │
│  4. bcrypt.compare(password, user.password)         │
│  5. JWT.sign({ id, email, role }, JWT_SECRET,      │
│     { expiresIn: '24h' })                           │
│  6. Update user.lastLoginAt                         │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  RESPONSE: { success, user (no password), token }   │
│                                                       │
│  FRONTEND stores:                                     │
│  - localStorage.setItem('cdc_auth_token', token)   │
│  - localStorage.setItem('cdc_token_expiry', ...)   │
│  - localStorage.setItem('cdc_session_id', userId)  │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  ROUTE: /dashboard → role-based redirect            │
│  - role=admin → AdminDashboard                      │
│  - role=mitra → MitraDashboard                      │
│  - role=user/mahasiswa → MahasiswaDashboard         │
└─────────────────────────────────────────────────────┘
```

### 2. ALUR DATA INITIAL (Load All Data)

```
┌─────────────────────────────────────────────────────┐
│  App.tsx: useEffect → initializeDB()                │
│                                                       │
│  1. fetchInitialDatabaseFromSupabase()               │
│     └→ GET /api/all-data (JWT token required)       │
│        └→ server.js → Prisma.findMany for ALL tables │
│           └→ Supabase PostgreSQL                     │
│                                                       │
│  2. If Supabase FAILS → localStorage fallback        │
│     └→ MEMORY_DB[key] = cached localStorage data    │
│                                                       │
│  3. MEMORY_DB populated → reloadDatabase()           │
│     └→ setAllLowongan(), setAllBerita(), etc.       │
│                                                       │
│  4. Real-time: Every mutation → syncToSupabase()     │
│     └→ POST /api/sync/:entity                        │
└─────────────────────────────────────────────────────┘
```

### 3. ALUR SYNC DATA (Create/Update)

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND: User action (create/edit)                │
│                                                       │
│  Example: Sync Lowongan                              │
│  syncLowonganToSupabase(lowonganData)               │
│       ↓                                              │
│  dbService.ts: sendSyncRequest('lowongan', payload) │
│       ↓                                              │
│  POST /api/sync/lowongan                            │
│       ↓                                              │
│  BACKEND: server.js                                  │
│  1. authenticateToken middleware (JWT validate)      │
│  2. entity === 'lowongan' → upsert via Prisma       │
│  3. Return { success, result }                       │
│       ↓                                              │
│  FRONTEND: MEMORY_DB['lowongan'] updated             │
│  localStorage sync if needed                         │
└─────────────────────────────────────────────────────┘
```

### 4. ALUR PENGAJUAN MAGANG (Application Flow)

```
┌─────────────────────────────────────────────────────┐
│  MAHASISWA → Lowongan Detail → Apply               │
│                                                       │
│  1. PengajuanMagang created                          │
│     - status: 'SUBMITTED'                            │
│     - mahasiswaId + lowonganId + mitraId             │
│                                                       │
│  2. ADMIN sees in dashboard                          │
│     - filter: status = SUBMITTED                     │
│     - can change to:                                 │
│       • SELEKSI_ADMINISTRASI                         │
│       • INTERVIEW                                    │
│       • DITERIMA / DITOLAK                           │
│                                                       │
│  3. MITRA sees application                           │
│     - interviewStatus tracking                       │
│     - interviewDate, method, link                    │
│                                                       │
│  4. Final status: ONGOING → COMPLETED                │
│     - status = 'COMPLETED'                           │
└─────────────────────────────────────────────────────┘
```

### 5. ALUR DATA FLOW KE SUPABASE

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND (React)                                   │
│                                                       │
│  TWO PARALLEL PATHS:                                 │
│                                                       │
│  PATH A: Supabase Direct (for real-time)             │
│  ┌────────────────────────────────────────────┐      │
│  │ supabase.from('table').select('*')         │      │
│  │ supabase.from('table').insert({...})       │      │
│  │ supabase.realtime subscription             │      │
│  └───────────────────┬────────────────────────┘      │
│                      │                              │
│  PATH B: Express API (for auth + complex logic)      │
│  ┌────────────────────────────────────────────┐      │
│  │ fetch('http://localhost:5000/api/all-data')│      │
│  │ fetch('http://localhost:5000/api/login')   │      │
│  │ fetch('http://localhost:5000/api/sync/:e') │      │
│  │ fetch('http://localhost:5000/api/:table')  │      │
│  └───────────────────┬────────────────────────┘      │
│                      │                              │
└──────────────────────┼──────────────────────────────┘
                       │
              ┌────────┴────────┐
              │    PRISMA       │
              │    ORM          │
              └────────┬────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│         SUPABASE POSTGRESQL DATABASE                 │
│                                                       │
│  All 26 tables with RLS policies                     │
│  - Public SELECT policies (published content)         │
│  - Service Role FULL access (backend only)            │
│  - Triggers: auto-update updatedAt                    │
│  - Indexes: email, role, status, nim, deadline        │
└──────────────────────────────────────────────────────┘
```

---

## 📋 SEMUA TABEL & FUNGSI & KONEKSI

### TIAP TABEL DIJELASKAN:

| # | Nama Tabel | Schema | Fungsi Utama | Terhubung ke | Diakses oleh |
|---|-----------|--------|-------------|-------------|-------------|
| 1 | **users** | `public` | Tabel master akun semua pengguna (admin, mahasiswa, alumni, mitra, viewer) | parent ke semua tabel via userId | Login.tsx, semua dashboard, /api/sync/users |
| 2 | **mahasiswas** | `public` | Profil detail mahasiswa aktif (NIM, IPK, skills, prodi) | FK: userId → users (CASCADE) | MahasiswaDashboard, syncMahasiswaToSupabase |
| 3 | **alumnis** | `public` | Profil alumni UM Kendari (status kerja, instansi) | FK: userId → users (CASCADE) | AlumniDashboard, survei_lulusans |
| 4 | **mitras** | `public` | Profil perusahaan/instansi mitra CDC | FK: userId → users (CASCADE) | MitraDashboard, lowongans, survei_lulusans |
| 5 | **lowongans** | `public` | Daftar lowongan magang & kerja dari mitra/admin | FK: mitraId → mitras, createdBy → users | Public layout, MahasiswaDashboard, AdminDashboard |
| 6 | **pengajuan_magangs** | `public` | Lamaran/ajuan mahasiswa ke lowongan | FK: mahasiswaId → mahasiswas, lowonganId → lowongans, mitraId → mitras | StudentApplicationsView, AdminDashboard |
| 7 | **tracer_studies** | `public` | Survei karir lulusan (tracer study) | FK: mahasiswaId → mahasiswas | TracerStudyForm, AdminDashboard |
| 8 | **konten_karirs** | `public` | Konten artikel berita, lowongan, program, workshop, dll | createdBy reference → users | PublicLayout, Beranda, Konten pages |
| 9 | **survei_lulusans** | `public` | Survei kepuasan mitra terhadap alumni | FK: mitraId → mitras, alumniId → alumnis | MitraDashboard |
| 10 | **beritas** | `public` | Berita portal CDC (dari konten_karirs jenis='berita') | FK: id → komentar_beritas | PublicLayout, BeritaDetailView |
| 11 | **komentar_beritas** | `public` | Komentar pengguna pada berita | FK: beritaId → beritas, userId → users | BeritaDetailView |
| 12 | **pengumumans** | `public` | Pengumuman resmi dari admin CDC | no FK | PublicLayout, Pengumuman page |
| 13 | **galeri_items** | `public` | Galeri foto kegiatan CDC | no FK | GaleriView |
| 14 | **kalender_kegiatans** | `public` | Kalender jadwal kegiatan CDC | no FK | KalenderKegiatanView |
| 15 | **hero_slides** | `public` | Slide banner carousel halaman utama | no FK | HeroSlider, PublicLayout |
| 16 | **job_fair_events** | `public` | Event job fair yang diselenggarakan CDC | FK: child → job_fair_companies | CareerFair, EventCardLayout |
| 17 | **job_fair_companies** | `public` | Perusahaan peserta job fair | FK: jobFairId → job_fair_events | CareerFair |
| 18 | **campus_hirings** | `public` | Program campus hiring dari perusahaan | no FK | CampusHiring |
| 19 | **mou_stakeholders** | `public` | Data MOU/kerjasama dengan stakeholder | no FK | MouStakeholderView |
| 20 | **surat_keputusans** | `public` | Dokumen surat keputusan resmi CDC | no FK | SuratKeputusanView |
| 21 | **laporan_kinerjas** | `public` | Laporan kinerja tahunan CDC | no FK | LaporanKinerjaView |
| 22 | **anggota_tims** | `public` | Data pengurus/anggota tim CDC | no FK | Team page |
| 23 | **konseling_configs** | `public` | Konfigurasi layanan konseling karir | no FK | Konseling page |
| 24 | **visi_misi_configs** | `public` | Konfigurasi visi & misi CDC | no FK | Tentang Kami page |
| 25 | **social_media_items** | `public` | Link media sosial CDC | no FK | Footer |
| 26 | **uploaded_documents** | `public` | Dokumen upload mahasiswa (CV, transkrip, dll) | FK: userId → users, mahasiswaId → mahasiswas | StudentProfileView |

**Supporting Tables (additional to above 26):**

| # | Nama Tabel | FK | Fungsi |
|---|-----------|----|--------|
| 27 | **mahasiswa_experiences** | mahasiswaId → mahasiswas | Riwayat pengalaman kerja/magang |
| 28 | **mahasiswa_certificates** | mahasiswaId → mahasiswas | Sertifikat & penghargaan |
| 29 | **mahasiswa_qualifications** | mahasiswaId → mahasiswas | Riwayat pendidikan |
| 30 | **survei_lulusans** | mitraId → mitras, alumniId → alumnis | Survei kepuasan mitra |

---

## ⚠️ KEAMANAN & RLS POLICIES SUMMARY

### Status RLS: AKTIF pada semua 26 tabel

**PUBLIC POLICIES (read tanpa login):**
- `lowongans` → SELECT WHERE status = 'PUBLISHED'
- `beritas` → SELECT WHERE status = 'published'
- `pengumumans` → SELECT WHERE status = 'published'
- `konten_karirs` → SELECT WHERE status = 'published'
- `galeri_items` → SELECT WHERE TRUE (semua bisa baca)
- `anggota_tims` → SELECT WHERE isActive = TRUE
- `hero_slides` → SELECT WHERE isActive = TRUE
- `job_fair_events` → SELECT WHERE TRUE
- `campus_hirings` → SELECT WHERE TRUE

**SERVICE ROLE POLICIES (backend full access):**
- **ALL TABLES** → ALL operations USING (TRUE) — artinya service role punya akses pENUH

### ⚠️ CRITICAL SECURITY FINDING:
> Service Role policies memberikan akses FULL ke SEMUA tabel untuk backend Supabase. Jika anon key bocor, attacker bisa baca semua data (termasuk data sensitif users).

---

## 📊 INDEXES YANG ADA

| Tabel | Index | Tujuan |
|-------|-------|--------|
| users | idx_users_email | Pencarian email cepat |
| users | idx_users_role | Filter per role |
| users | idx_users_status | Filter status akun |
| mahasiswas | idx_mahasiswas_nim | Cari NIM |
| mahasiswas | idx_mahasiswas_prodi | Filter per prodi |
| mahasiswas | idx_mahasiswas_angkatan | Filter per angkatan |
| alumnis | idx_alumnis_prodi | Filter per prodi |
| alumnis | idx_alumnis_tahun_lulus | Filter per tahun |
| lowongans | idx_lowongans_status | Filter published |
| lowongans | idx_lowongans_tipe | Filter magang/kerja |
| lowongans | idx_lowongans_deadline | Urutkan deadline |
| lowongans | idx_lowongans_mitra | Filter per mitra |
| pengajuan | idx_pengajuan_mahasiswa | Filter lamaran mahasiswa |
| pengajuan | idx_pengajuan_lowongan | Filter per lowongan |
| pengajuan | idx_pengajuan_status | Filter per status |
| beritas | idx_beritas_status | Filter published |
| beritas | idx_beritas_created_at | Urutkan terbaru |

---

## 🔧 TRIGGERS

Semua tabel utama memiliki trigger `update_updated_at_column()`:
users, mahasiswas, alumnis, mitras, lowongans, pengajuan_magangs, konten_karirs, beritas, pengumumans, kalender_kegiatans, job_fair_events

Function: `update_updated_at_column()` → SET NEW.updatedAt = NOW()
