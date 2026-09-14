# Rencana: Perbaikan `VITE_API_URL` & Jalur Build Produksi

> **Status:** Menunggu ACC Boss
> **Tanggal:** 2026-09-14
> **Scope:** HANYA jalur API (frontend → backend → Supabase). TIDAK menyentuh 16 fungsi `save*` localStorage, TIDAK menyentuh seed fallback.
> **Dibuat dengan:** superpowers:writing-plans
>
> ⚠️ **DIPERBARUI 2026-09-14:** Boss mengonfirmasi Supabase + Vercel = **test bed sementara**;
> target akhir = **server kampus**. Lihat plan pendamping:
> `docs/superpowers/plans/2026-09-14-migrasi-server-kampus.md`.
>
> **Konsekuensi ke plan ini:** pilihan "Opsi A vs Opsi B" (§3) jadi **tidak relevan**.
> Jawabannya sudah pasti: **`/api` relative + proxy di lapisan infrastruktur**, karena itu
> satu-satunya konfigurasi yang membuat build Vercel **identik** dengan build kampus
> (tidak perlu rebuild saat pindah). Bagian §3 & Lampiran Opsi B di bawah dipertahankan
> sebagai catatan analisis, bukan lagi sebagai pilihan.

---

## 1. Masalah yang Diselesaikan

Klaim "100% Supabase" di commit `bc7f769` belum berlaku di build produksi. Semua request tulis
jatuh ke `http://localhost:5000/api` karena `VITE_API_URL` tidak pernah di-set. Efeknya:
di server, login & seluruh CRUD mati — tampak "jalan" di laptop dev hanya karena backend
lokal hidup.

## 2. Temuan Terverifikasi

| # | Temuan | Bukti |
|---|---|---|
| A | `VITE_API_URL` tidak ada di `.env` | Isi `.env`: `DATABASE_URL`, `DIRECT_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`, `PORT`, `NODE_ENV`, `JWT_SECRET` |
| B | Tidak ada di `.env.example` | Hanya `VITE_SUPABASE_*` |
| C | Fallback hardcoded di 2 titik | `src/services/dbService.ts:28`, `src/App.tsx:173` |
| D | `server.js` tidak menyajikan frontend | Tidak ada `express.static`; `dist/` nggantung |
| E | Proxy `/api` di `vite.config.ts:16` dead code | Dev pakai URL absolut, bukan relative |
| F | Nama env konsisten kode ↔ docs | kode baca `import.meta.env.VITE_API_URL` ✅ |
| G | Belum ada konfigurasi deployment | Tidak ada `Dockerfile` / Procfile / `vercel.json` |
| H | 🔴 **Blocker:** `FRONTEND_URL` absen padahal `NODE_ENV` diset | CORS `server.js:71-78` akan tolak semua origin di prod |

## 3. Prinsip Desain: Aman untuk 2 Opsi Hosting

Plan ini **tidak bergantung** pada keputusan hosting. Satu variabel env (`VITE_API_URL`)
mengendalikan perilaku:

| Opsi | Deskripsi | Nilai `VITE_API_URL` | Task 5 |
|---|---|---|---|
| **A — 1 origin** | `server.js` sajikan `dist/` | `/api` (relative) | Jalankan Task 5 (wajib) |
| **B — 2 origin** | Frontend Vercel, backend Railway/Render/VPS | `https://<backend-host>/api` | Task 5 jadi opsional |

Konsekuensi per opsi:
- **Opsi A:** CSP & CORS tidak perlu diubah. Cookie httpOnly same-origin jalan mulus.
- **Opsi B:** WAJIB (1) `FRONTEND_URL` diisi domain frontend, (2) tambahkan domain backend ke
  `connectSrc` di `server.js:44`, (3) pastikan credentials/cookie lintas-domain dikonfigurasi
  (`SameSite=None; Secure`).

## 4. File Structure

| File | Aksi | Tanggung jawab |
|---|---|---|
| `src/config/api.ts` | **CREATE** | Satu sumber kebenaran `API_BASE_URL` |
| `vite.config.ts` | MODIFY | Tambah `preview.proxy` (server.proxy sudah ada) |
| `.env.example` | MODIFY | Dokumentasi template env |
| `.env` | MODIFY | Nilai dev (ter-gitignore) |
| `.env.production` | **CREATE** | Nilai produksi untuk `vite build` (ter-gitignore) |
| `src/services/dbService.ts` | MODIFY | Buang hardcode + re-export, impor dari config |
| `src/App.tsx` | MODIFY | Buang hardcode + hapus logout ganda |
| `server.js` | MODIFY | `express.static(dist)` + SPA fallback (Opsi A) |

**Titik sisip Task 5 terverifikasi:** handler 404 ada di `server.js:709`. Sisipkan di **baris 709
(sebelumnya)**, yaitu tepat setelah blok `app.delete('/api/:table/:id')` yang berakhir ~baris 705.

---

## Task 1 — `src/config/api.ts` (sumber kebenaran tunggal)

**Files:** Create `src/config/api.ts`
**Interfaces:** `export const API_BASE_URL: string`

**Langkah:**
1. Baca `import.meta.env.VITE_API_URL`.
2. Bila kosong → `/api` (relative). **JANGAN** fallback ke `localhost:5000` — itu akar bug.
3. Normalisasi: bila nilai tidak berakhiran `/api` dan berupa URL absolut, tempel `/api`.
   (Nilai `/api` relative dibiarkan apa adanya.)
4. Buang trailing slash sebelum return.

**Kode acuan:**
```ts
const RAW = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api';

function normalizeApiBase(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (trimmed.startsWith('/')) return trimmed;      // relative → apa adanya
  if (/\/api$/.test(trimmed)) return trimmed;        // sudah lengkap
  return `${trimmed}/api`;                           // absolut tanpa /api
}

export const API_BASE_URL = normalizeApiBase(RAW);
```

**Verifikasi:**
```bash
npx tsc --noEmit          # 0 error
```

---

## Task 2 — `vite.config.ts`: proxy untuk dev & `preview`

**Files:** Modify `vite.config.ts`

**Koreksi penting:** pendekatan `define`/`__API_BASE_URL__` **dibatalkan** — itu dead code, karena
`src/config/api.ts` membaca `import.meta.env.VITE_API_URL`, bukan `__API_BASE_URL__`. Vite sudah
otomatis mengekspos variabel ber-prefix `VITE_` dari `.env` ke `import.meta.env`. Jadi nilai
datang dari file env (Task 3), bukan dari `define`.

**Langkah:**
1. `server.proxy` sudah ada (`/api` → `:5000`) — **pertahankan**.
2. Tambah blok `preview.proxy` yang identik. `vite preview` **tidak** memakai `server.proxy`,
   sehingga tanpa ini `npm run preview` (build prod lokal) akan gagal konek ke backend:
```ts
preview: {
  proxy: {
    '/api': { target: 'http://localhost:5000', changeOrigin: true },
  },
},
```
3. Tidak ada perubahan lain. `loadEnv` tidak diperlukan.

**Verifikasi:**
```bash
npx vite build && grep -c "localhost:5000" dist/assets/*.js   # HARUS 0
```

---

## Task 3 — `.env` + `.env.example`

**Files:** Modify `.env.example`, `.env`

**Langkah — `.env.example`:**
```bash
# Frontend → Backend.
#   Opsi A (1 origin, server.js menyajikan dist/): "/api"
#   Opsi B (2 origin, frontend & backend terpisah): "https://<backend>/api"
VITE_API_URL="/api"

# Origin frontend yang diizinkan CORS. WAJIB diisi di production.
FRONTEND_URL="http://localhost:3000"
```

**Langkah — `.env`:** tambah 2 baris sama dengan nilai nyata.
Nilai awal `/api` aman untuk dev (proxy Task 2 meneruskannya ke `:5000`).

**Langkah — `.env.production` (CREATE):** Vite memuat `.env.production` saat `vite build`
dan menimpanya di atas `.env`. Ini tempat nilai produksi sebenarnya:
```bash
# Opsi A (1 origin): "/api"
# Opsi B (2 origin) : "https://<backend-host>/api"
VITE_API_URL="/api"
```
Tanpa file ini, `vite build` memakai nilai `.env` (yang untuk dev) — berisiko salah kirim build.

**Verifikasi:**
```bash
grep -E "VITE_API_URL|FRONTEND_URL" .env .env.example .env.production
npx vite build && grep -o "localhost:5000" dist/assets/*.js | wc -l   # HARUS 0
```

---

## Task 4 — Bersihkan hardcoded di `dbService.ts` & `App.tsx`

**Files:** Modify `src/services/dbService.ts` (baris 24–28), `src/App.tsx` (baris 170–175)

**Langkah:**
1. `dbService.ts`: hapus blok `const API_BASE_URL = ...` (baris 24–28), ganti jadi
   `import { API_BASE_URL } from '../config/api';`
2. Hapus `export { API_BASE_URL };` di baris 329. **Terverifikasi aman** — audit menemukan
   `API_BASE_URL` hanya dipakai internal di `dbService.ts` sendiri; tidak ada file lain di
   `src/` yang mengimpornya. Tidak akan ada import yang pecah.
3. `App.tsx:173`: ada **duplikasi logout** — baris 170 `fetch('/api/logout')` (relative) lalu
   baris 173 fetch absolut. Hapus baris 173–175, sisakan yang relative (lebih ringkas & sudah
   same-origin). Bila `apiFetch`/config ingin konsisten, boleh ganti baris 170 jadi
   `fetch(\`${API_BASE_URL}/logout\`)` + impor `API_BASE_URL`.
4. Perbarui komentar header `dbService.ts:7` yang masih menyebut `localhost:5000`.

**Verifikasi:**
```bash
grep -rn "localhost:5000" src/ | grep -v node_modules   # 0 hasil (selain komentar)
grep -rn "API_BASE_URL" src/ --include=*.ts --include=*.tsx  # importer hanya dbService & App
npx tsc --noEmit
```

---

## Task 5 — `server.js` sajikan `dist/` (Opsi A; opsional bila Opsi B)

**Files:** Modify `server.js`

**Langkah:**
1. Impor: `import path from 'path'; import { fileURLToPath } from 'url';`
2. Sisipkan **setelah** semua route `/api` dan **sebelum** handler 404 (~baris 692):
```js
const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
app.use(express.static(distDir));
app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
```

**⚠️ Urutan krusial:** static + SPA fallback HARUS sebelum `app.use((req,res) => 404)`.
Bila salah urutan, semua halaman balik `{"error":"Not found"}`.

**Verifikasi:**
```bash
npm run build && NODE_ENV=production npm start   # di terminal terpisah
curl -s http://localhost:5000/ | head -5         # HTML index, BUKAN JSON 404
curl -s http://localhost:5000/berita | head -5   # SPA fallback → HTML
curl -s http://localhost:5000/api/health         # tetap {"status":"ok",...}
```

---

## Task 6 — Verifikasi End-to-End (bukti, bukan klaim)

1. `npm run build` → grep `localhost:5000` di `dist/assets/*.js` = **0**.
2. Jalankan prod mode; buka browser; login pakai akun seed.
3. Network tab: request harus ke **same-origin** `/api/...`.
4. `npx tsx scripts/check_supabase_data.ts` → `Users` harus cocok dengan `userCount` di
   `/api/health` (saat ini **11**). Tidak cocok = jalur tulis masih salah.
5. Simpan screenshot bukti login sukses dari build prod.

---

## Risiko

| Risiko | Mitigasi |
|---|---|
| SPA fallback regex salah → API balik HTML | Task 5 verifikasi cek `/api/health` **dan** `/` |
| `define` mengubah nilai jadi string salah | Selalu `JSON.stringify` |
| `.env` ke-commit | `.gitignore:7` sudah `env*` ✅ |
| Server prod bukan Node (Vercel) | Opsi B: Task 5 diganti `vercel.json` rewrites + `connectSrc` + `FRONTEND_URL` |
| Cookie httpOnly gagal lintas-domain | Opsi B: set `SameSite=None; Secure` |

---

## Yang MASIH Rusak Setelah Plan Ini (jujur)

Plan ini **hanya** memperbaiki jalur API. Tidak menyentuh:

1. **16 fungsi `save*` localStorage** — hero slides, statistik, keanggotaan tim, konseling,
   campus hiring, job fair, visi-misi, helpdesk, CDC club, WA prestasi (tulisan mentok di
   browser; admin edit → hilang antar device).
2. **Seed palsu menahan data kosong** — `data.ts:2162` (`length > 0`). Supabase `Lowongans: 0`
   → UI tampil 7 lowongan dummy, bukan data asli.
3. **`FRONTEND_URL` wajib diisi** sebelum deploy prod, kalau tidak CORS blokir total
   (temuan H).

Backlog ini layak jadi plan terpisah (Plan 2 & Plan 3).

---

## Pertanyaan Terbuka untuk Boss

1. Backend di-host di mana? (Railway / Render / VPS / lain)
2. Frontend & backend 1 domain atau 2 domain?

Jawaban ini hanya menentukan **nilai `VITE_API_URL`** dan **apakah Task 5 dijalankan** —
seluruh Task 1–4 & 6 identik untuk kedua opsi.

---

# LAMPIRAN — Opsi B (2 origin) — ⚠️ BACA DULU

## 🔴 Temuan Kritikal: `sameSite: 'strict'` MEMATIKAN Opsi B

`server.js:286-290` — cookie auth di-set:
```js
res.cookie('auth_token', token, {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'strict' : 'lax',   // ← INI MASALAHNYA
  maxAge: 24 * 60 * 60 * 1000,
  path: '/'
});
```
Dan `clearCookie` di `server.js:301` memakai setelan sama.

**Dampak:** `SameSite=Strict` berarti cookie **TIDAK dikirim** pada request lintas-site.
Bila frontend (`https://app.vercel.app`) dan backend (`https://api.railway.app`) beda origin,
cookie `auth_token` tidak akan pernah terkirim → **semua endpoint privat balik 401** →
dashboard admin/mitra/mahasiswa blank.

Yang penting: `dbService.ts` mengirim token via header Bearer **dan** `credentials: 'include'`.
Header Bearer tetap jalan lintas-origin, jadi login **tampak** berhasil — tapi begitu halaman
di-refresh dan token dibaca dari cookie, sesi hilang. Ini bug yang sulit didiagnosis.

### Perbaikan wajib untuk Opsi B

**File:** `server.js` (baris 286–290 dan 301)

```js
const isCrossOrigin = Boolean(process.env.FRONTEND_URL) &&
  !process.env.FRONTEND_URL.includes(process.env.API_PUBLIC_HOST || '###none###');

const cookieOpts = {
  httpOnly: true,
  secure: isProd,
  // Opsi A (same-origin) → 'strict' tetap aman & paling kuat.
  // Opsi B (cross-origin) → WAJIB 'none'; browser mensyaratkan Secure=true.
  sameSite: isProd ? (isCrossOrigin ? 'none' : 'strict') : 'lax',
  maxAge: 24 * 60 * 60 * 1000,
  path: '/'
};
```
Terapkan ke `res.cookie` **dan** `res.clearCookie` (opsi clearCookie harus identik, kalau tidak
cookie tidak terhapus saat logout → sesi hantu).

**Peringatan keamanan:** `SameSite=None` melemahkan pertahanan CSRF dan **hanya boleh** dipakai
bersamaan dengan:
- `secure: true` (sudah ✅ di prod)
- CORS whitelist ketat (sudah ✅ via `allowedOrigins`)
- `Access-Control-Allow-Credentials` (sudah ✅ `server.js:84`)

Karena itu **Opsi A secara keamanan lebih unggul** — `server.js:62` sudah pasang
`trust proxy` + deteksi `x-forwarded-proto`, yang hanya masuk akal bila frontend & backend
seorigin.

## Lampiran Task B1 — CSP `connectSrc` (baris 44)

`server.js:44` saat ini hanya mengizinkan Supabase + localhost. Untuk Opsi B tambahkan host backend:
```js
connectSrc: ["'self'", 'https://*.supabase.co', 'https://*.supabase.in',
             'https://<backend-host>', ...dev],
```
Tanpa ini, browser memblokir request ke backend — pesan error hanya muncul di console,
UI tampak "hang" tanpa penjelasan.

## Lampiran Task B2 — CORS `allowedOrigins` (baris 68–74)

Pastikan `FRONTEND_URL` = origin frontend persis (tanpa trailing slash, dengan skema).
`allowedOrigins.includes(origin)` adalah pencocokan **string persis** — satu `/` di akhir
sudah cukup membuat CORS gagal.

## Lampiran Task B3 — Ganti Task 5 jadi `vercel.json`

Bila frontend di Vercel (static), Task 5 (`express.static`) **tidak berlaku**. Gantinya:

**Create `vercel.json`:**
```json
{
  "rewrites": [
    { "source": "/((?!api).*)", "destination": "/index.html" }
  ]
}
```

## Ringkasan Perbandingan

| Aspek | Opsi A (1 origin) | Opsi B (2 origin) |
|---|---|---|
| `VITE_API_URL` | `/api` | `https://<backend>/api` |
| Task 5 | Jalankan (`express.static`) | Ganti `vercel.json` |
| Cookie `sameSite` | tetap `strict` ✅ | **wajib `none`** ⚠️ |
| CSP `connectSrc` | tidak berubah ✅ | wajib tambah host |
| CORS `FRONTEND_URL` | tidak berubah ✅ | wajib diisi persis |
| CSRF exposure | rendah | lebih tinggi |
| Jumlah file diubah | 7 | 8 |

**Rekomendasi saya (setelah temuan cookie): Opsi A.** Lebih sedikit perubahan, dan
`sameSite: 'strict'` tetap utuh — itu pertahanan CSRF yang tidak perlu dikorbankan.

