# 🛡️ LAPORAN AUDIT KEAMANAN MENYELURUH & PENTEST ASSESSMENT
## Portal CDC Universitas Muhammadiyah Kendari (UM Kendari)
**Tanggal Audit:** September 2026  
**Auditor / Engine:** Security Assessment Protocol (OWASP Top 10 + CIS Benchmark)  
**Lingkup:** Supabase PostgreSQL Database, Express.js Backend API (`server.js`), React Frontend (`src/`)

---

## 📑 EXECUTIVE SUMMARY

| Kategori | Rating | Keterangan |
|---|---|---|
| **Overall Security Posture** | 🟡 **MEDIUM-HIGH** | Arsitektur backend sudah di-harden dengan JWT & bcrypt, namun terdapat celah pada validasi auth client-side dan scope RLS database. |
| **Supabase Database Security** | 🟡 **MEDIUM** | RLS aktif di 26 tabel, tetapi kebijakan `Service Role` menggunakan `USING (TRUE)` tanpa batasan granular. |
| **Backend API (Express.js)** | 🟢 **GOOD** | Rate-limiting aktif, JWT protection di endpoint sensitif, validasi whitelist tabel delete & sync. |
| **Frontend Security (React)** | 🟡 **MEDIUM** | `Login.tsx` melakukan verifikasi password di memory/localStorage sebelum memanggil API, serta fast-role switcher aktif di bundle. |
| **Data Protection & Privacy** | 🟢 **GOOD** | Password disimpan dalam bentuk hash Bcrypt (`$2b$10$...`), password tidak di-expose pada endpoint `/api/all-data`. |

---

## 🔍 TEMUAN AUDIT KEAMANAN (DETAILED FINDINGS)

### 🔴 1. [HIGH] Client-Side Password Validation & Plaintext Comparison di `Login.tsx`
- **Lokasi:** `src/components/Login.tsx:81-100`
- **Temuan:**
  Komponen `Login.tsx` melakukan pencarian user dari `getFromDB('users')` (localStorage) dan membandingkan password secara langsung:
  ```typescript
  const userPassword = matched.password || '';
  const isValidPassword = password === userPassword;
  ```
  Di database live, password berbentuk hash Bcrypt (`$2b$10$...`). Jika data live dari Supabase dimuat ke localStorage, password string yang diinput user tidak akan pernah cocok dengan hash string di sisi client kecuali user menggunakan bypass atau data fallback lokal.
- **Risiko Keamanan:**
  1. Password hash tersimpan di `localStorage` browser pengguna (`cdc_users`), rentan terhadap serangan XSS (Credential Harvesting).
  2. Logika login terfragmentasi antara `App.tsx` (yang memanggil `/api/login` backend) dan `Login.tsx` (yang memeriksa memory lokal).
- **Rekomendasi Remediasi:**
  Ubah `Login.tsx` agar 100% bergantung pada endpoint backend `/api/login` dan **jangan pernah** menyimpan kolom `password` di `localStorage`.
  Catatan: `App.tsx` sudah memiliki jalur login ke backend (`/api/login`, token disimpan di `cdc_auth_token`), namun `Login.tsx` saat ini tidak menggunakannya — verifikasi terjadi sepenuhnya di sisi client.

---

### 🔴 1b. [HIGH] Fallback User Admin Sintetis Tanpa Autentikasi di `App.tsx`
- **Lokasi:** `src/App.tsx:171-190` (`handleFastRoleSwitch`)
- **Temuan:**
  Jika user dengan role yang dicari tidak ditemukan di memory DB, aplikasi **membuat objek user admin sintetis** secara langsung:
  ```typescript
  if (!target) {
    if (role === 'admin') {
      target = { id: 'usr_admin', name: 'Operator CDC UM Kendari', email: 'admin@umkendari.ac.id', role: 'admin', ... };
    }
    ...
  }
  ```
  Artinya siapa pun bisa membuka `AdminDashboard` tanpa kredensial sama sekali melalui role switcher.
- **Risiko Keamanan:**
  Meskipun endpoint backend tetap memerlukan JWT, seluruh data yang sudah dimuat di memory DB (lowongan, pengajuan, users) tampil penuh di dashboard tanpa login. Ini adalah **broken access control di lapisan UI**.
- **Rekomendasi Remediasi:**
  Hapus blok fallback `usr_admin` dan seluruh `#aistudio-role-switcher` sebelum deploy produksi (bungkus dengan `import.meta.env.DEV`).

---

### 🟡 2. [MEDIUM] Fast-Role Switcher Utility Terpapar di UI Publik
- **Lokasi:** `src/App.tsx:278-313`
- **Temuan:**
  Terdapat bar navigasi debug (`#aistudio-role-switcher`) yang memungkinkan siapa saja beralih role (`Admin CDC`, `USER`, `Mitra`) hanya dengan menekan tombol dan langsung membuka dashboard terkait tanpa token autentikasi server.
- **Risiko Keamanan:**
  Meskipun akses data backend (`/api/all-data`, `/api/sync/users`) memerlukan JWT token yang valid, antarmuka dashboard admin dan data yang tersimpan di cache frontend dapat diakses oleh publik tanpa login.
- **Rekomendasi Remediasi:**
  Bungkus role switcher dengan pengecekan lingkungan:
  ```typescript
  {process.env.NODE_ENV !== 'production' && <RoleSwitcher />}
  ```
  Atau hapus sebelum proses deployment production (`npm run build`).

---

### 🟡 3. [MEDIUM] Kebijakan Supabase Row Level Security (RLS) Terlalu Terbuka
- **Lokasi:** `docs/arsip-supabase/001_create_all_tables.sql:843-946` (dulu `supabase/migrations/`)
- **Temuan:**
  Kebijakan RLS untuk Service Role dibuat dengan:
  ```sql
  CREATE POLICY "Service role akses penuh users"
    ON "users" FOR ALL USING (TRUE);
  ```
  Namun tabel-tabel seperti `galeri_items`, `job_fair_events`, dan `campus_hirings` memiliki kebijakan publik `USING (TRUE)` untuk operasi `SELECT`, sementara tabel `pengajuan_magangs` dan `tracer_studies` hanya diproteksi melalui service role tanpa policy per-user (`auth.uid() = userId`).
- **Risiko Keamanan:**
  Jika frontend menggunakan Supabase Client langsung (`src/supabaseClient.ts`) dengan Anon Key untuk membaca tabel selain yang berstatus `PUBLISHED`, query langsung dapat membaca seluruh baris jika policy tidak dibatasi per `userId`.
- **Rekomendasi Remediasi:**
  Terapkan granular policy berbasis user ID di Supabase:
  ```sql
  CREATE POLICY "Mahasiswa hanya baca pengajuan sendiri"
    ON "pengajuan_magangs" FOR SELECT
    USING (auth.uid()::text = "userId"::text);
  ```

---

### 🟢 4. [LOW / RESOLVED] SQL Injection Hardening pada Dynamic Table Query
- **Lokasi:** `server.js:261-310` & `server.js:610-676`
- **Status:** **SUDAH DIPERBAIKI / SECURE**
- **Evaluasi:**
  - Endpoint `GET /api/:table` memvalidasi input terhadap `ALLOWED_TABLES` whitelist.
  - Endpoint `DELETE /api/:table/:id` memetakan nama URL ke model Prisma yang diproteksi ORM parameterized query (`prisma[modelName].deleteMany({ where: { id } })`), sehingga kebal terhadap injeksi SQL.

---

### 🟢 5. [LOW / RESOLVED] Brute Force & Rate Limiting Proteksi
- **Lokasi:** `server.js:83-96`
- **Status:** **SUDAH DIPERBAIKI / SECURE**
- **Evaluasi:**
  - Login dibatasi maksimal 5 percobaan per 15 menit per IP (`loginLimiter`).
  - API umum dibatasi maksimal 100 request per menit per IP (`apiLimiter`).
  - Response error login menggunakan pesan generik (`Email atau password salah`) untuk mencegah User Enumeration attack.

---

## 📋 ACTION PLAN REKOMENDASI KEAMANAN

1. **Prioritas 1 (Kritis):** Hapus penyimpanan field `password` dari `localStorage` dan alihkan auth `Login.tsx` sepenuhnya ke `POST /api/login`.
2. **Prioritas 2 (Tinggi):** Nonaktifkan `#aistudio-role-switcher` pada build production.
3. **Prioritas 3 (Sedang):** Terapkan RLS policy granular di Supabase untuk tabel `pengajuan_magangs`, `tracer_studies`, dan `uploaded_documents`.
   - **Automated Execution:** Cukup jalankan `npm run db:harden` (atau `npx tsx scripts/harden_rls.ts`) untuk secara otomatis menerapkan dan memverifikasi RLS policies di database.
   - **Verifikasi RLS:** Jalankan `npm run db:verify-rls`.
4. **Prioritas 4 (Pemeliharaan):** Rotasi `JWT_SECRET` berkala dan pastikan nilainya minimal 64 karakter acak di environment production.
