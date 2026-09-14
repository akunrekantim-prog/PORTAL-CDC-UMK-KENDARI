# Rencana: Migrasi ke Server Kampus (Supabase/Vercel = Test Bed Sementara)

> **Status:** Menunggu ACC Boss
> **Tanggal:** 2026-09-14
> **Konteks:** Supabase + Vercel dipakai **sementara untuk testing awal**. Target akhir = server kampus (permanen).
> **Tujuan plan:** memastikan testing di Supabase **valid** dan migrasi ke kampus **murah** — bukan dua pekerjaan terpisah.

---

## 1. Kesimpulan Utama (baca ini dulu)

**Arsitektur Boss sudah benar dan portabel.** Supabase **tidak** dipakai sebagai platform — hanya
sebagai PostgreSQL biasa. Tidak ada vendor lock-in nyata.

Bukti: `src/supabaseClient.ts` ada tapi **0 importer** (dead code). Frontend **tidak pernah**
bicara langsung ke Supabase. Semua lewat `frontend → Express API → Prisma → PostgreSQL`.
Pindah ke kampus = ganti 1 nilai `DATABASE_URL`. Itu saja.

**Konsekuensi strategis:** karena Supabase cuma test bed, **plan `VITE_API_URL` tetap prioritas #1** —
bukan karena "biar prod jalan", tapi karena **kalau salah, Boss menguji build yang bukan build
sebenarnya**, sehingga bug baru muncul di server kampus, bukan saat testing.

---

## 2. Temuan Terverifikasi (dengan bukti)

| # | Temuan | Bukti |
|---|---|---|
| A | Supabase dipakai sebagai PostgreSQL biasa | `supabaseClient.ts` = 0 importer; frontend tak pakai SDK Supabase |
| B | DB total hanya **12 MB** | `pg_database_size` |
| C | **RLS aktif di 26 tabel** | `pg_class.relrowsecurity=true` |
| D | RLS saat ini **dekoratif** | role `postgres` punya `rolbypassrls=true` → Prisma melewati RLS |
| E | Policy pakai `auth.uid()` — **Supabase-only** | `auth.uid()` → `NULL` tanpa JWT (dibuktikan via query) |
| F | 🔴 **Bom waktu kampus**: `pengajuan_magangs`, `tracer_studies`, `uploaded_documents` punya `force=true` | `relforcerowsecurity=true` |
| G | Policy menargetkan `roles={public}` | berlaku untuk SEMUA role non-bypass |
| H | `harden_rls.ts` pakai Supabase Management API | tak akan jalan di kampus |
| I | `prisma/migrations/` **KOSONG** | hanya `schema.prisma` |
| J | `supabase/migrations/*.sql` **ke-commit** | 3 file = **sumber kebenaran kedua** → risiko drift |
| K | Skema DB saat ini **bersih** dari base64 | berita 0/11, hero 0/6, anggota 0/12 base64 |
| L | Tapi jalur upload **akan** simpan base64 | `compressImageAdaptive` → `canvas.toDataURL` → kolom DB (~90–160 KB/gambar) |
| M | `lowongans`: 0 baris, 29 dead tuple, 264 kB | pernah_insert=64 → bloat dari seed yang dihapus |
| N | Belum ada konfigurasi deploy | tidak ada nginx / pm2 / Dockerfile / Procfile |
| O | `VITE_API_URL` absen; fallback `localhost:5000` | `dbService.ts:28`, `App.tsx:173` |

### 🔴 Temuan F — penjelasan lengkap (paling penting)

Tiga tabel punya **`force=true`** (`FORCE ROW LEVEL SECURITY`). Artinya RLS tetap berlaku
**walaupun** yang mengakses adalah pemilik tabel.

Policy-nya:
```sql
USING ((auth.uid())::text = "userId")
```

Dan `auth.uid()` **mengembalikan NULL** bila tidak ada JWT (terbukti). Maka:
```
NULL = 'usr_alumni_xxx'  →  NULL (bukan TRUE)  →  baris difilter
```

**Kenapa sekarang tidak kelihatan masalahnya?** Karena role `postgres` punya `bypassrls=true`,
sehingga RLS dilewati total. Policy itu **security theater** untuk jalur Prisma.

**Kapan meledak?** Saat migrasi ke kampus. Kalau admin DB kampus membuat user aplikasi
**tanpa** `BYPASSRLS` (praktik yang benar dan lazim), maka:
- Mahasiswa mengajukan magang → **tersimpan** tapi **tak pernah terlihat** di dashboard
- Tracer study → kosong terus
- Upload dokumen → hilang dari daftar

Gejalanya menyesatkan: "belum ada yang apply", padahal data masuk. Boss akan kehilangan
berhari-hari mencari ini.

**Saya sudah uji dengan transaksi yang di-rollback** (tidak ada data berubah, total tetap 0).
Predikat policy terbukti `lolos=false`.

---

## 3. Prinsip: Satu Build, Tiga Lingkungan

Kesalahan yang harus dihindari: **membakar nama host ke dalam build**. Kalau
`VITE_API_URL` diisi `https://backend.railway.app/api`, maka saat pindah ke kampus
**wajib rebuild + retest ulang** — dan itu membatalkan makna "sudah ditest".

**Solusi: selalu `/api` (relative), atur di lapisan infrastruktur.**

| Lingkungan | `VITE_API_URL` | Yang mengarahkan `/api` |
|---|---|---|
| Dev | `/api` | `vite.config.ts` → `server.proxy` ✅ sudah ada |
| Vercel (testing) | `/api` | `vercel.json` → `rewrites` ke backend |
| **Kampus (final)** | `/api` | nginx → `location /api` ke Node |

**Hasil: SATU build artifact yang sama dipakai di ketiga lingkungan. Tidak perlu rebuild saat
pindah ke kampus.** Ini yang membuat testing di Vercel benar-benar mewakili kampus.

---

## 4. File Structure

| File | Aksi | Tanggung jawab |
|---|---|---|
| `src/config/api.ts` | **CREATE** | Satu sumber kebenaran `API_BASE_URL` |
| `vite.config.ts` | MODIFY | Tambah `preview.proxy` |
| `.env` / `.env.example` | MODIFY | `VITE_API_URL=/api`, `FRONTEND_URL` |
| `.env.production` | **CREATE** | Nilai produksi (juga `/api`) |
| `vercel.json` | **CREATE** | Rewrite `/api` → backend (fase testing) |
| `src/services/dbService.ts` | MODIFY | Buang hardcode + re-export |
| `src/App.tsx` | MODIFY | Buang hardcode + logout ganda |
| `src/supabaseClient.ts` | **DELETE** | Dead code yang `throw` — jebakan |
| `server.js` | MODIFY | `express.static(dist)` + SPA fallback |
| `supabase/migrations/004_drop_rls.sql` | **CREATE** | Netralkan RLS sebelum migrasi |
| `docs/DEPLOY_SERVER_KAMPUS.md` | **CREATE** | Runbook migrasi |

---

# BAGIAN I — Perbaikan Sekarang (blokir validitas testing)

## Task 1 — `src/config/api.ts`

**Files:** Create `src/config/api.ts`
**Interfaces:** `export const API_BASE_URL: string`

1. Baca `import.meta.env.VITE_API_URL`, default `/api`.
2. Normalisasi: buang trailing slash; bila absolut tanpa `/api`, tempel `/api`.
3. **JANGAN** fallback ke `localhost:5000`.

```ts
const RAW = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api';

function normalizeApiBase(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (trimmed.startsWith('/')) return trimmed;
  if (/\/api$/.test(trimmed)) return trimmed;
  return `${trimmed}/api`;
}

export const API_BASE_URL = normalizeApiBase(RAW);
```

**Verifikasi:** `npx tsc --noEmit` → 0 error

---

## Task 2 — `vite.config.ts`

**Files:** Modify `vite.config.ts`

1. `server.proxy` sudah ada — pertahankan.
2. Tambah `preview.proxy` identik (`vite preview` tidak mewarisi `server.proxy`):
```ts
preview: {
  proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } },
},
```

**Verifikasi:** `npx vite build && grep -c "localhost:5000" dist/assets/*.js` → **0**

---

## Task 3 — Env files

**Files:** Modify `.env`, `.env.example`; Create `.env.production`

Isi ketiganya (semua `/api` — lihat Prinsip §3):
```bash
VITE_API_URL="/api"
FRONTEND_URL="http://localhost:3000"
```

**Verifikasi:** `grep -E "VITE_API_URL|FRONTEND_URL" .env .env.example .env.production`

---

## Task 4 — Bersihkan hardcode

**Files:** Modify `src/services/dbService.ts` (24–28, 329), `src/App.tsx` (170–175)

1. `dbService.ts`: hapus blok `const API_BASE_URL`, impor dari `../config/api`.
2. Hapus `export { API_BASE_URL };` — **terverifikasi 0 importir eksternal**.
3. `App.tsx`: hapus logout ganda (baris 173–175), sisakan yang relative.
4. Perbarui komentar `dbService.ts:7`.

**Verifikasi:** `grep -rn "localhost:5000" src/` → 0; `npx tsc --noEmit`

---

## Task 5 — `server.js` sajikan `dist/`

**Files:** Modify `server.js`

Sisipkan **sebelum** handler 404 (baris **709**) dan **sesudah** semua route `/api`:
```js
import path from 'path';
import { fileURLToPath } from 'url';
// ...
const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
app.use(express.static(distDir));
app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
```

**⚠️ Urutan krusial** — kalau sesudah 404, semua halaman balik JSON 404.

**Verifikasi:**
```bash
npm run build && NODE_ENV=production npm start
curl -s http://localhost:5000/ | head -3        # HTML
curl -s http://localhost:5000/berita | head -3  # HTML (SPA fallback)
curl -s http://localhost:5000/api/health        # {"status":"ok"}
```

---

## Task 6 — `vercel.json` (untuk fase testing)

**Files:** Create `vercel.json`
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://<backend-testing>/api/$1" }
  ]
}
```
Dengan ini frontend tetap pakai `/api` → **build identik dengan kampus**.

---

## Task 7 — Hapus `src/supabaseClient.ts`

**Files:** Delete `src/supabaseClient.ts`

Dead code (0 importer) tapi punya `throw` di top-level. Kalau suatu saat ada yang mengimpornya
saat `VITE_SUPABASE_*` sudah dihapus → **crash total**. Hapus sekarang selagi terbukti tak dipakai.

**Verifikasi:** `grep -rn "supabaseClient" src/` → 0 hasil; `npx tsc --noEmit`

---

## Task 8 — Verifikasi end-to-end (bukti)

1. `npm run build` → grep `localhost:5000` di `dist/assets/*.js` = **0**
2. Jalankan prod mode, login, cek Network tab → request ke **same-origin** `/api/...`
3. `npx tsx scripts/check_supabase_data.ts` → `Users: 11` harus cocok dengan `/api/health` (`userCount`)
4. Simpan screenshot bukti

---

# BAGIAN II — Persiapan Migrasi Kampus

## Task 9 — Netralkan RLS (`supabase/migrations/004_drop_rls.sql`)

**Files:** Create `supabase/migrations/004_drop_rls.sql`

**Alasan:** policy pakai `auth.uid()` yang tidak ada di PostgreSQL kampus. Lihat §2 temuan F.

```sql
-- Dijalankan SEBELUM pg_dump untuk migrasi ke server kampus.
-- Policy ini memakai auth.uid() (Supabase-only) dan akan MEMBUAT APLIKASI BUTA
-- bila role kampus tidak punya BYPASSRLS.
-- Otorisasi sesungguhnya sudah ditegakkan di lapisan Express (JWT + authenticateToken).

DROP POLICY IF EXISTS "Mahasiswa hanya baca pengajuan sendiri" ON pengajuan_magangs;
DROP POLICY IF EXISTS "Mitra hanya baca pengajuan ke perusahaannya" ON pengajuan_magangs;
DROP POLICY IF EXISTS "Mahasiswa hanya baca tracer study sendiri" ON tracer_studies;
DROP POLICY IF EXISTS "User hanya baca dokumen sendiri" ON uploaded_documents;
DROP POLICY IF EXISTS "Service role akses penuh pengajuan" ON pengajuan_magangs;
DROP POLICY IF EXISTS "rls_service_role_pengajuan_full" ON pengajuan_magangs;
DROP POLICY IF EXISTS "Service role akses penuh tracer study" ON tracer_studies;
DROP POLICY IF EXISTS "Service role akses penuh uploaded_documents" ON uploaded_documents;
DROP POLICY IF EXISTS "rls_mahasiswa_baca_pengajuan_sendiri" ON pengajuan_magangs;
DROP POLICY IF EXISTS "rls_user_baca_tracer_study_sendiri" ON tracer_studies;
DROP POLICY IF EXISTS "rls_user_baca_dokumen_sendiri" ON uploaded_documents;

ALTER TABLE pengajuan_magangs   DISABLE ROW LEVEL SECURITY;
ALTER TABLE tracer_studies      DISABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_documents  DISABLE ROW LEVEL SECURITY;
```

**⚠️ Jangan jalankan di Supabase sekarang** tanpa ACC — ini mengubah DB live.
Siapkan filenya, jalankan saat mau migrasi (atau saat kampus siap).

**Catatan keamanan jujur:** RLS saat ini **tidak memberi perlindungan nyata** (bypassrls=true),
jadi menghapusnya tidak menurunkan keamanan. Batas keamanan sebenarnya = middleware
`authenticateToken` di `server.js`. Namun **defense-in-depth DB hilang** — dicatat sebagai
trade-off yang disadari.

---

## Task 10 — `prisma/migrations/` (hilangkan drift)

**Files:** `prisma/migrations/`

Masalah: `prisma/migrations/` kosong, tapi `supabase/migrations/*.sql` ke-commit →
**dua sumber kebenaran** yang bisa menyimpang. Di kampus tidak ada cara tahu mana yang asli.

**Langkah:**
1. Jadikan `schema.prisma` sebagai **satu-satunya** sumber kebenaran skema.
2. Generate baseline:
```bash
mkdir -p prisma/migrations/0_init
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql
npx prisma migrate resolve --applied 0_init
```
3. Pindahkan `supabase/migrations/*.sql` → `docs/arsip-supabase/` (tandai historis, jangan dijalankan).

**Verifikasi:** `npx prisma migrate status` → bersih

---

## Task 11 — Base64 gambar → file storage

**Files:** `src/components/AdminDashboard.tsx`, `server.js`

**Kondisi sekarang:** DB bersih (temuan K). **Tapi** jalur upload menyimpan base64 JPEG
(~90–160 KB) langsung ke kolom DB (temuan L).

**Dampak di kampus:** server kampus punya disk terbatas. 100 gambar × 120 KB = 12 MB hanya
untuk gambar, di dalam row DB. `pg_dump` jadi berat, backup lambat, dan query melambat.

**Langkah (bisa ditunda, tapi jangan lupa):**
1. Tambah endpoint `POST /api/upload` → simpan ke `uploads/` → kembalikan URL.
2. `compressImageAdaptive` kirim ke endpoint itu, simpan **path** ke DB (bukan base64).
3. `express.static('/uploads')` untuk menyajikannya.
4. Migrasi data lama: tidak perlu (temuan K — belum ada base64 signifikan).

---

## Task 12 — Runbook `docs/DEPLOY_SERVER_KAMPUS.md`

**Files:** Create `docs/DEPLOY_SERVER_KAMPUS.md`

Isi (langkah bernomor, ada rollback):

1. **Prasyarat kampus:** Node 20+, PostgreSQL 14+, nginx, pm2 (atau systemd)
2. **Buat role aplikasi:**
   ```sql
   CREATE ROLE portal_cdc LOGIN PASSWORD '<kuat>';
   CREATE DATABASE portal_cdc OWNER portal_cdc;
   ```
   > ⚠️ JANGAN beri `BYPASSRLS` — dan itulah sebabnya Task 9 wajib.
3. **Migrasi skema:** `npx prisma migrate deploy`
4. **Migrasi data dari Supabase:**
   ```bash
   pg_dump "$DATABASE_URL_SUPABASE" --no-owner --no-acl -f backup.sql
   psql "$DATABASE_URL_KAMPUS" -f backup.sql
   ```
   Verifikasi jumlah baris per tabel **sebelum & sesudah** (11 users, 11 berita, dst).
5. **Build & deploy:**
   ```bash
   npm ci && npm run build
   NODE_ENV=production pm2 start server.js --name portal-cdc
   ```
6. **nginx:**
   ```nginx
   server {
     listen 443 ssl;
     server_name portal-cdc.umkendari.ac.id;
     root /var/www/portal-cdc/dist;
     location /api { proxy_pass http://127.0.0.1:5000; proxy_set_header Host $host; }
     location / { try_files $uri /index.html; }
   }
   ```
   → `/api` relative = **build yang sama, tanpa rebuild** ✅
7. **Env kampus:** `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET` (baru!), `FRONTEND_URL=https://portal-cdc.umkendari.ac.id`, `NODE_ENV=production`
   → `VITE_SUPABASE_*` **dihapus** (tidak lagi dipakai)
8. **Hapus dependensi Supabase:** `npm uninstall @supabase/supabase-js`; hapus `scripts/harden_rls.ts`
9. **Rollback:** simpan `backup.sql` + build sebelumnya; `pm2 stop` → restore → `pm2 start`

---

## Task 13 — Bereskan `lowongans` (temuan M)

**Files:** — (operasional)

`lowongans`: 0 baris, 264 kB, 29 dead tuple (pernah_insert=64). UI menampilkan **7 lowongan
dummy** dari `DEFAULT_SEEDS` karena `data.ts:2162` (`length > 0`).

1. Putuskan: seed ulang lowongan asli, atau biarkan kosong?
2. Kalau kosong: perbaiki `initializeDB()` agar data kosong **tidak** ditimpa seed palsu.
3. Reclaim bloat: `VACUUM FULL lowongans;`

---

## Risiko

| Risiko | Mitigasi |
|---|---|
| RLS kampus bikin app buta | Task 9 dijalankan **sebelum** dump |
| Lupa `JWT_SECRET` baru di kampus | Runbook langkah 7; server.js sudah `throw` di prod |
| `pg_dump` gagal karena versi beda | Tes dump **sekarang** selagi masih bisa dibandingkan |
| `/api` relative tanpa proxy di Vercel | Task 6 `vercel.json` |
| Drift skema | Task 10 |
| Gambar base64 membengkakkan DB kampus | Task 11 |

---

## Verifikasi Akhir (definition of done)

- [ ] `grep -rn "localhost:5000" dist/assets/*.js` → 0
- [ ] Login dari build prod → request ke `/api/...` (same-origin)
- [ ] `check_supabase_data.ts` cocok dengan `/api/health`
- [ ] `npx prisma migrate status` bersih
- [ ] `grep -rn "supabaseClient\|auth.uid" src/ server.js` → 0
- [ ] `004_drop_rls.sql` tersedia & teruji di DB salinan

---

## Prioritas

| Fase | Task | Kenapa |
|---|---|---|
| **1 — Sekarang** | 1–8 | Tanpa ini, testing di Vercel **tidak mewakili** kampus |
| **2 — Sebelum kampus** | 9, 10, 12 | Blokir migrasi; RLS = bom waktu |
| **3 — Bisa menyusul** | 11, 13 | Penting, tidak memblokir |

---

## Yang MASIH Rusak & Belum Masuk Plan Ini

1. **16 fungsi `save*` localStorage** — hero slides, statistik, keanggotaan tim, konseling,
   campus hiring, job fair, visi-misi. Admin edit → hilang antar device, dan **tidak akan
   ikut ke server kampus**. Terkonfirmasi: `hero_slides` ada 6 baris di Supabase tapi UI
   membaca `getHeroSlides()` dari localStorage → **data terbelah dua**.
   → Layak jadi **Plan 3**.
2. **`FRONTEND_URL`** wajib diisi sebelum deploy prod (CORS).
