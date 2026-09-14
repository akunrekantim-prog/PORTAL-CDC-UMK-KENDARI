# 🗄️ Database Setup & Schema - Portal CDC UMK Kendari

## 📋 Table of Contents
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Database Schema](#database-schema)
- [Setup Instructions](#setup-instructions)
- [Seeding & Migrations](#seeding--migrations)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Portal CDC UM Kendari menggunakan **PostgreSQL** yang di-host di **Supabase** dengan ORM **Prisma** untuk type-safe database operations.

### Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                  │
│                    http://localhost:3000                    │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
                       │ JWT Auth
┌──────────────────────▼──────────────────────────────────────┐
│              Backend (Express.js + Prisma)                  │
│                  http://localhost:5000                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ - JWT Authentication (jsonwebtoken)                  │  │
│  │ - Bcrypt Password Hashing (bcryptjs)                 │  │
│  │ - Rate Limiting (express-rate-limit)                 │  │
│  │ - Security Headers (helmet)                          │  │
│  │ - CORS Protection                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ Prisma Client
                       │ Connection Pooling
┌──────────────────────▼──────────────────────────────────────┐
│              Supabase PostgreSQL Database                   │
│            (Connection Pooler - Session Mode)               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Tables: 27 models                                    │  │
│  │ Enums: 6 types                                       │  │
│  │ Relations: Complex many-to-many relationships        │  │
│  │ Indexes: Optimized for queries                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Technology Stack

### Backend Core
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Runtime** | Node.js | 18+ | JavaScript runtime |
| **Framework** | Express.js | 4.21.2 | REST API server |
| **ORM** | Prisma | 6.12.0 | Database toolkit & type-safe queries |
| **Database** | PostgreSQL | 15+ | Relational database (via Supabase) |

### Security & Auth
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Password Hashing** | bcryptjs (3.0.3) | Hash passwords with 10 rounds |
| **Authentication** | jsonwebtoken (9.0.3) | JWT token generation & validation |
| **Security Headers** | helmet (8.3.0) | HTTP security headers |
| **Rate Limiting** | express-rate-limit (8.7.0) | Prevent brute-force attacks |
| **CORS** | Custom middleware | Restrict origins |

### Database Access
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Client** | @prisma/client (6.19.3) | Generated type-safe database client |
| **Migrations** | Prisma Migrate | Schema versioning |
| **Hosting** | Supabase | Managed PostgreSQL with connection pooler |

---

## 🗂️ Database Schema

### Entity Relationship Overview

Portal CDC memiliki **27 models** dan **6 enums** yang saling berelasi:

```
┌─────────────┐
│    User     │ ← Central authentication table
└──────┬──────┘
       │ 1:1 relationships
       ├────────> Mahasiswa (students)
       ├────────> Alumni (graduates)
       └────────> Mitra (partners/companies)
```

### Core Tables

#### 1. **users** (Authentication & Roles)
```sql
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT,                    -- Bcrypt hashed
  phone       TEXT,
  role        UserRole DEFAULT 'MAHASISWA',
  status      UserStatus DEFAULT 'PENDING',
  photoUrl    TEXT,
  lastLoginAt TIMESTAMP,
  createdAt   TIMESTAMP DEFAULT NOW(),
  updatedAt   TIMESTAMP DEFAULT NOW()
);
```

**Enum: UserRole**
- `USER` - Regular user
- `MAHASISWA` - Student
- `ALUMNI` - Graduate
- `JOB_SEEKER` - Job seeker
- `MITRA` - Partner/Company
- `ADMIN` - Administrator
- `VIEWER` - Read-only viewer

**Enum: UserStatus**
- `PENDING` - Awaiting approval
- `ACTIVE` - Active account
- `INACTIVE` - Deactivated
- `REJECTED` - Registration rejected

---

#### 2. **mahasiswa** (Students)
```sql
CREATE TABLE mahasiswa (
  id                UUID PRIMARY KEY,
  userId            UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  nim               TEXT UNIQUE NOT NULL,
  nama              TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT,
  programStudi      TEXT NOT NULL,
  fakultas          TEXT NOT NULL,
  angkatan          TEXT NOT NULL,
  semester          INT DEFAULT 1,
  alamat            TEXT,
  photoUrl          TEXT,
  aboutMe           TEXT,
  ipk               TEXT,
  skills            TEXT[] DEFAULT ARRAY[]::TEXT[],
  sendOpportunities TEXT,
  cvName            TEXT,
  createdAt         TIMESTAMP DEFAULT NOW(),
  updatedAt         TIMESTAMP DEFAULT NOW()
);
```

**Relations:**
- Belongs to `users` (1:1)
- Has many `pengajuan_magang` (internship applications)
- Has many `tracer_studies` (graduate tracking)

---

#### 3. **alumni** (Graduates)
```sql
CREATE TABLE alumni (
  id              UUID PRIMARY KEY,
  userId          UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  nim             TEXT UNIQUE NOT NULL,
  nama            TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  programStudi    TEXT NOT NULL,
  fakultas        TEXT NOT NULL,
  angkatanLulus   TEXT NOT NULL,
  tahunLulus      TEXT,
  alamat          TEXT,
  photoUrl        TEXT,
  currentJob      TEXT,
  currentCompany  TEXT,
  linkedin        TEXT,
  createdAt       TIMESTAMP DEFAULT NOW(),
  updatedAt       TIMESTAMP DEFAULT NOW()
);
```

---

#### 4. **mitra** (Partners/Companies)
```sql
CREATE TABLE mitra (
  id                UUID PRIMARY KEY,
  userId            UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  namaInstansi      TEXT NOT NULL,
  bidangUsaha       TEXT,
  alamat            TEXT,
  phone             TEXT,
  email             TEXT NOT NULL,
  logoUrl           TEXT,
  website           TEXT,
  picName           TEXT,
  picPhone          TEXT,
  picEmail          TEXT,
  statusKerjasama   StatusKerjasama DEFAULT 'PENDING',
  deskripsi         TEXT,
  createdAt         TIMESTAMP DEFAULT NOW(),
  updatedAt         TIMESTAMP DEFAULT NOW()
);
```

**Enum: StatusKerjasama**
- `AKTIF` - Active partnership
- `NONAKTIF` - Inactive
- `PENDING` - Pending approval

---

#### 5. **lowongan** (Job/Internship Postings)
```sql
CREATE TABLE lowongan (
  id                UUID PRIMARY KEY,
  mitraId           UUID REFERENCES mitra(id) ON DELETE CASCADE,
  judul             TEXT NOT NULL,
  tipe              TipeLowongan NOT NULL,
  posisi            TEXT NOT NULL,
  deskripsi         TEXT NOT NULL,
  requirements      TEXT NOT NULL,
  lokasi            TEXT NOT NULL,
  salary            TEXT,
  kuota             INT DEFAULT 1,
  deadline          TIMESTAMP,
  status            StatusLowongan DEFAULT 'DRAFT',
  logoUrl           TEXT,
  companyName       TEXT,
  createdAt         TIMESTAMP DEFAULT NOW(),
  updatedAt         TIMESTAMP DEFAULT NOW()
);
```

**Enum: TipeLowongan**
- `MAGANG` - Internship
- `KERJA` - Full-time job

**Enum: StatusLowongan**
- `DRAFT` - Draft/unpublished
- `PUBLISHED` - Live posting
- `CLOSED` - Closed for applications
- `ARCHIVED` - Archived

---

#### 6. **pengajuan_magang** (Internship/Job Applications)
```sql
CREATE TABLE pengajuan_magang (
  id              UUID PRIMARY KEY,
  mahasiswaId     UUID REFERENCES mahasiswa(id) ON DELETE CASCADE,
  lowonganId      UUID REFERENCES lowongan(id) ON DELETE CASCADE,
  nama            TEXT NOT NULL,
  nim             TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  programStudi    TEXT,
  judul           TEXT NOT NULL,
  cvUrl           TEXT,
  motivation      TEXT,
  status          StatusPengajuan DEFAULT 'DRAFT',
  reviewedBy      TEXT,
  reviewNotes     TEXT,
  submittedAt     TIMESTAMP,
  reviewedAt      TIMESTAMP,
  createdAt       TIMESTAMP DEFAULT NOW(),
  updatedAt       TIMESTAMP DEFAULT NOW()
);
```

**Enum: StatusPengajuan**
- `DRAFT` - Draft application
- `SUBMITTED` - Submitted, awaiting review
- `UNDER_REVIEW` - Under review
- `REVISION` - Needs revision
- `ACCEPTED` - Accepted
- `REJECTED` - Rejected
- `ONGOING` - Currently active
- `REPORT_SUBMITTED` - Final report submitted
- `COMPLETED` - Completed successfully
- `MENUNGGU_REVIEW` - Awaiting review
- `SELEKSI_ADMINISTRASI` - Administrative selection
- `INTERVIEW` - Interview stage
- `DITERIMA` - Accepted (confirmed)
- `DITOLAK` - Rejected (confirmed)

---

### Content Management Tables

#### 7. **berita** (News/Articles)
```sql
CREATE TABLE berita (
  id          UUID PRIMARY KEY,
  title       TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  excerpt     TEXT,
  body        TEXT NOT NULL,
  imageUrl    TEXT,
  author      TEXT,
  kategori    TEXT DEFAULT 'berita',
  publishedAt TIMESTAMP,
  createdAt   TIMESTAMP DEFAULT NOW(),
  updatedAt   TIMESTAMP DEFAULT NOW()
);
```

#### 8. **konten_karir** (Career Content)
Similar structure to `berita`, for career tips and guidance.

#### 9. **pengumuman** (Announcements)
```sql
CREATE TABLE pengumuman (
  id        UUID PRIMARY KEY,
  title     TEXT NOT NULL,
  body      TEXT NOT NULL,
  kategori  TEXT DEFAULT 'umum',
  priority  TEXT DEFAULT 'normal',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

---

### Configuration Tables

#### 10. **hero_slides** (Homepage Carousel)
```sql
CREATE TABLE hero_slides (
  id          UUID PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  imageUrl    TEXT NOT NULL,
  linkText    TEXT,
  linkUrl     TEXT,
  urutan      INT DEFAULT 0,
  createdAt   TIMESTAMP DEFAULT NOW()
);
```

#### 11. **visi_misi_configs** (Vision & Mission)
```sql
CREATE TABLE visi_misi_configs (
  id        UUID PRIMARY KEY,
  kategori  TEXT NOT NULL,  -- 'visi' | 'misi'
  content   TEXT NOT NULL,
  urutan    INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

#### 12. **anggota_tims** (Team Members)
```sql
CREATE TABLE anggota_tims (
  id        UUID PRIMARY KEY,
  name      TEXT NOT NULL,
  position  TEXT NOT NULL,
  photoUrl  TEXT,
  bio       TEXT,
  email     TEXT,
  phone     TEXT,
  urutan    INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

---

### Tracking & Reporting Tables

#### 13. **tracer_studies** (Graduate Tracking)
```sql
CREATE TABLE tracer_studies (
  id                UUID PRIMARY KEY,
  mahasiswaId       UUID REFERENCES mahasiswa(id),
  nama              TEXT NOT NULL,
  nim               TEXT NOT NULL,
  email             TEXT NOT NULL,
  tahunLulus        TEXT NOT NULL,
  currentJob        TEXT,
  currentCompany    TEXT,
  salary            TEXT,
  relevance         TEXT,
  suggestions       TEXT,
  createdAt         TIMESTAMP DEFAULT NOW()
);
```

#### 14. **laporan_kinerja** (Performance Reports)
```sql
CREATE TABLE laporan_kinerja (
  id         UUID PRIMARY KEY,
  periode    TEXT NOT NULL,
  metrics    JSONB,
  highlights TEXT,
  createdAt  TIMESTAMP DEFAULT NOW()
);
```

#### 15. **kalender_kegiatan** (Event Calendar)
```sql
CREATE TABLE kalender_kegiatan (
  id          UUID PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  startDate   TIMESTAMP NOT NULL,
  endDate     TIMESTAMP,
  lokasi      TEXT,
  kategori    TEXT DEFAULT 'umum',
  createdAt   TIMESTAMP DEFAULT NOW()
);
```

---

### Administrative Tables

#### 16. **surat_keputusan** (Decision Letters)
```sql
CREATE TABLE surat_keputusan (
  id         UUID PRIMARY KEY,
  nomor      TEXT UNIQUE NOT NULL,
  judul      TEXT NOT NULL,
  tanggal    TIMESTAMP NOT NULL,
  fileUrl    TEXT,
  createdAt  TIMESTAMP DEFAULT NOW()
);
```

#### 17. **mou_stakeholders** (MoU Management)
```sql
CREATE TABLE mou_stakeholders (
  id            UUID PRIMARY KEY,
  namaInstansi  TEXT NOT NULL,
  logoUrl       TEXT,
  jenisMou      TEXT,
  tanggalMou    TIMESTAMP,
  berlakuHingga TIMESTAMP,
  status        TEXT DEFAULT 'aktif',
  createdAt     TIMESTAMP DEFAULT NOW()
);
```

#### 18. **galeri_items** (Gallery/Media)
```sql
CREATE TABLE galeri_items (
  id          UUID PRIMARY KEY,
  title       TEXT NOT NULL,
  imageUrl    TEXT NOT NULL,
  description TEXT,
  kategori    TEXT DEFAULT 'kegiatan',
  createdAt   TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- npm/pnpm/yarn/bun
- Supabase account
- Git

### Step 1: Clone & Install
```bash
git clone <repository-url>
cd PORTAL-CDC-UMK-KENDARI
npm install
```

### Step 2: Environment Configuration

Create `.env` file from template:
```bash
cp .env.example .env
```

Fill in the following variables:

```bash
# Database - from Supabase Dashboard → Project Settings → Database
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres"

# Supabase - from Supabase Dashboard → Project Settings → API
VITE_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
VITE_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# JWT Secret - generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET="your-secure-random-string-here"

# Server Config
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

### Step 3: Generate Prisma Client
```bash
npx prisma generate
```

### Step 4: Push Schema to Database
```bash
npx prisma db push
```

### Step 5: Seed Database with Sample Data
```bash
npm run tsx scripts/seed_full_database.ts
```

---

## 🌱 Seeding & Migrations

### Seed Scripts Available

| Script | Purpose | Usage |
|--------|---------|-------|
| `seed_full_database.ts` | Complete database seeding with all tables | `npm run tsx scripts/seed_full_database.ts` |
| `reseed_with_hashed_passwords.ts` | Re-seed users with bcrypt-hashed passwords | `npm run tsx scripts/reseed_with_hashed_passwords.ts` |
| `repair_null_passwords.ts` | Fix NULL passwords in existing users | `npm run tsx scripts/repair_null_passwords.ts` |
| `check_supabase_data.ts` | Verify data integrity | `npm run tsx scripts/check_supabase_data.ts` |
| `test_password_hash.ts` | Test bcrypt hashing | `npm run tsx scripts/test_password_hash.ts` |

### Seeding Process

#### Full Database Seed
```bash
npm run tsx scripts/seed_full_database.ts
```

This will:
1. ✅ Insert 8 users (Admin, Mahasiswa, Alumni, Mitra) with bcrypt-hashed passwords
2. ✅ Insert mahasiswa records linked to users
3. ✅ Insert alumni records
4. ✅ Insert mitra (company) records
5. ✅ Insert lowongan (job postings)
6. ✅ Insert konten_karir & berita (career content & news)
7. ✅ Insert pengumuman (announcements)
8. ✅ Insert surat_keputusan (decision letters)
9. ✅ Insert kalender_kegiatan (events)
10. ✅ Insert mou_stakeholder (MoU records)
11. ✅ Insert galeri_items (gallery photos)

**Default Seed Accounts (password via env, TIDAK ditulis di repo):**
| Email | Password | Role | Status |
|-------|----------|------|--------|
| admin@umkendari.ac.id | via `SEED_ADMIN_PASSWORD` | ADMIN | ACTIVE |
| mhs@umkendari.ac.id | via `SEED_MAHASISWA_PASSWORD` | MAHASISWA | ACTIVE |
| alumni@umkendari.ac.id | via `SEED_ALUMNI_PASSWORD` | ALUMNI | ACTIVE |
| mitra@umkendari.ac.id | via `SEED_MITRA_PASSWORD` | MITRA | ACTIVE |

⚠️ **SECURITY:** Change these passwords immediately after deployment!

---

### Schema Migrations

When you modify `prisma/schema.prisma`:

```bash
# Generate migration files
npx prisma migrate dev --name describe_your_changes

# Apply migrations to production
npx prisma migrate deploy
```

---

## 🔒 Security

### Password Hashing
All passwords are hashed with **bcrypt** (10 rounds) before storage:
```javascript
import bcrypt from 'bcryptjs';
const hashedPassword = await bcrypt.hash(plainPassword, 10);
```

### JWT Authentication
Tokens are signed with HS256 algorithm:
```javascript
const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  JWT_SECRET,
  { expiresIn: '24h' }
);
```

### Rate Limiting
- **Login endpoint:** 5 attempts per IP per 15 minutes
- **API endpoints:** 100 requests per IP per minute

### CORS Protection
Only allowed origins can access the API:
- `http://localhost:3000`
- `http://localhost:5000`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5000`
- `process.env.FRONTEND_URL`

### Security Headers (Helmet.js)
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- X-XSS-Protection

---

## 🔧 Troubleshooting

### Issue: Cannot connect to database
```
Error: P1001: Can't reach database server
```

**Solution:**
1. Verify DATABASE_URL in `.env`
2. Check Supabase project is active
3. Verify connection pooler is enabled (Session Mode, Port 5432)
4. Test connection: `npx prisma db pull`

---

### Issue: Prisma Client not generated
```
Error: @prisma/client did not initialize yet
```

**Solution:**
```bash
npx prisma generate
```

---

### Issue: Migration failed
```
Error: P3009: migrate found failed migrations
```

**Solution:**
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or push schema without migration
npx prisma db push --force-reset
```

---

### Issue: NULL passwords in users table
```
Error: Password belum diset
```

**Solution:**
```bash
npm run tsx scripts/repair_null_passwords.ts
```

---

### Issue: JWT_SECRET not set
```
Error: CRITICAL: JWT_SECRET must be set
```

**Solution:**
```bash
# Generate secure secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Add to .env
JWT_SECRET="<generated-secret>"
```

---

## 📊 Database Statistics

- **Total Models:** 27 tables
- **Total Enums:** 6 types
- **Relationships:** Many-to-many via junction tables
- **Indexes:** Optimized for common queries (email, nim, slug)
- **Cascading Deletes:** Enabled for dependent records

---

## 🔗 Related Documentation

- [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) - Backend technical details
- [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md) - Security audit results
- [SEED_PASSWORDS_README.md](SEED_PASSWORDS_README.md) - Password management guide
- [.env.example](../.env.example) - Environment variables template

---

## 📞 Support

For database issues:
1. Check logs: `npm run server` (view Express logs)
2. Verify schema: `npx prisma studio` (open Prisma Studio GUI)
3. Test queries: `npx prisma db pull` (sync schema)

For Supabase-specific issues, refer to:
- [Supabase Dashboard](https://app.supabase.com)
- [Supabase Docs](https://supabase.com/docs)
- [Prisma Supabase Guide](https://www.prisma.io/docs/guides/database/supabase)

---

**Last Updated:** September 4, 2026
**Database Version:** PostgreSQL 15.x (Supabase)
**Schema Version:** Latest (see `prisma/migrations/`)
