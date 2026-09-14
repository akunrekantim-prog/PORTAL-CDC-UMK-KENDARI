# 100% Input ke Supabase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Setiap inputan user 100% tertulis ke Supabase PostgreSQL, tidak ada lagi data yang nyangkut di localStorage.

**Architecture:** Supabase via Express+Prisma jadi source of truth. Frontend `saveToDB/insertToDB/updateInDB` diubah dari fire-and-forget menjadi awaited write: tulis ke Supabase dulu, baru update MEMORY_DB + cache lokal. Gagal = throw ke UI, bukan silent lokal.

**Tech Stack:** React+Vite, Express server.js, Prisma, Supabase PostgreSQL, JWT, Zod, Playwright.

**Spec:** Permintaan Boss di chat 2026-09-14: "buat setiap inputan 100 persen ke supabase jadi data yang sekarang ada di database supabase itu bertambah sesuai dengan apa yang di input".

## Global Constraints

- JWT_SECRET min 32 char, wajib di production (server.js:20-33).
- Tidak ada password plaintext / fallback 'password' (pernah dihapus di HIGH-02).
- Rate limit tetap aktif: loginLimiter, apiLimiter, registerLimiter, writeLimiter (server.js:96-114).
- Helmet CSP + HSTS tetap aktif (server.js:36-52).
- Body limit 2MB, payload sync max 1.5MB (server.js:56 + 370).
- `npm run lint` (tsc --noEmit) harus hijau.
- `npm run build` (vite build) harus sukses.
- Playwright chromium minimal 5/5 tetap hijau.

---

## File Structure

- Modify: `src/services/dbService.ts` — sync jadi throw-on-fail + return data server.
- Modify: `src/data.ts:2259-2340` — saveToDB/insertToDB/updateInDB/deleteInDB/getFromDB/initializeDB jadi Supabase-first.
- Modify: `src/components/Register.tsx:224-330` — hapus fallback lokal, gagal = pesan error.
- Modify: `server.js:359-514` — tambah entity yang belum didukung ke allowedEntities + handler upsert.
- Test: `tests/supabase-write.spec.ts` (baru) + `scripts/verify_supabase_write.ts` (baru).
- Docs: update `docs/DATABASE_TABLES_GUIDE.md` Alur 2 (CRUD via saveToDB).

---

### Task 1: Backend — lengkapi POST /api/sync/:entity untuk semua DBKey

**Files:**
- Modify: `server.js:366-367` (allowedEntities)
- Modify: `server.js:461-514` (tambah handler entity)
- Test: `scripts/verify_supabase_write.ts`

**Interfaces:**
- Consumes: `TABLE_TO_MODEL` (server.js:303-332) — sudah ada mapping untuk berita, pengumuman, surat_keputusan, kalender_kegiatan, laporan_kinerja, mou_stakeholder, galeri_items, social_media, komentar_berita, survei_lulusan, uploaded_documents.
- Produces: `POST /api/sync/:entity` return `{ success: true, result }` untuk semua entity di atas.

Kondisi hari ini: allowedEntities hanya `users,user,mahasiswa,alumni,mitra,lowongan,pengajuan_magang,tracer_study,tracer_studies,konten_karir`. Akibatnya 11 DBKey lain (berita, pengumuman, survei_lulusan, surat_keputusan, kalender_kegiatan, laporan_kinerja, mou_stakeholder, galeri_items, social_media, komentar_berita, uploaded_documents) tidak punya jalur sync — saveToDB untuk key itu hanya tulis lokal.

- [ ] **Step 1: Tambah entity ke whitelist**

```js
// server.js:366 ganti menjadi:
const allowedEntities = new Set(['users','user','mahasiswa','alumni','mitra','lowongan','pengajuan_magang','tracer_study','tracer_studies','konten_karir','berita','pengumuman','survei_lulusan','surat_keputusan','kalender_kegiatan','laporan_kinerja','mou_stakeholder','galeri_items','social_media','komentar_berita','uploaded_documents']);
```

- [ ] **Step 2: Tambah handler generik upsert untuk entity konten (setelah blok konten_karir, sebelum res 400)**

```js
if (entity === 'berita') {
  if (r !== 'ADMIN') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator.' });
  const result = await prisma.berita.upsert({
    where: { id: payload.id },
    update: { title: String(payload.title||'').slice(0,200), content: payload.content ? String(payload.content).slice(0,20000) : null, status: String(payload.status||'published').slice(0,20) },
    create: { id: payload.id, title: String(payload.title||'').slice(0,200), slug: String(payload.slug||payload.id).slice(0,220), content: payload.content ? String(payload.content).slice(0,20000) : null, status: String(payload.status||'published').slice(0,20), authorId: requesterId }
  });
  return res.json({ success: true, result });
}
```

Pola yang sama diulang untuk pengumuman, survei_lulusan, surat_keputusan, kalender_kegiatan, laporan_kinerja, mou_stakeholder, galeri_items, social_media, komentar_berita, uploaded_documents — masing-masing pakai `prisma[model].upsert` dengan field yang sudah ada di schema (cek `prisma/schema.prisma` sebelum tulis, jangan karang field).

- [ ] **Step 3: Verifikasi manual**

Run: `node -e "import('./server.js')"` tidak perlu — cukup `npm run lint`
Expected: PASS (server.js tetap valid, tidak ada import error)

- [ ] **Step 4: Commit**

```bash
git add server.js
git commit -m "feat: lengkapi sync entity ke Supabase untuk semua DBKey"
```

---

### Task 2: dbService — sync gagal harus throw, bukan return false diam-diam

**Files:**
- Modify: `src/services/dbService.ts:209-234` (sendSyncRequest)
- Modify: `src/services/dbService.ts:236-255` (deleteFromSupabase)
- Test: `scripts/verify_supabase_write.ts`

**Interfaces:**
- Consumes: `getAuthToken()` (dbService.ts:32) — JWT dari localStorage.
- Produces: `sendSyncRequest(entity, payload): Promise<any>` — resolve = row dari server, reject = Error dengan pesan jujur. `syncXxxToSupabase` ikut berubah return type jadi `Promise<any>`.

Kondisi hari ini: `sendSyncRequest` return `false` saat tanpa token / non-OK / exception, dan `saveToDB` mengabaikannya. Itu akar "input masuk lokal tapi tidak ke Supabase".

- [ ] **Step 1: Ubah sendSyncRequest jadi throw-on-fail**

```ts
async function sendSyncRequest(entity: string, payload: any): Promise<any> {
  const headers = authHeaders();
  if (!headers.Authorization) {
    throw new Error('Belum login. Silakan login ulang agar data tersimpan ke Supabase.');
  }
  const response = await fetch(`${API_BASE_URL}/sync/${entity}`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.error || data.message || `Gagal menyimpan ${entity} ke Supabase (status ${response.status}).`);
  }
  console.log(`✅ [Supabase API Sync] ${entity} tersimpan ke Supabase PostgreSQL:`, data);
  return data.result ?? data;
}
```

- [ ] **Step 2: Ubah deleteFromSupabase dengan pola sama**

```ts
export async function deleteFromSupabase(table: string, id: string): Promise<boolean> {
  const headers = authHeaders();
  if (!headers.Authorization) {
    throw new Error('Belum login. Hapus dibatalkan agar data tidak hanya hilang lokal.');
  }
  const response = await fetch(`${API_BASE_URL}/${table}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Gagal menghapus ${table}/${id} di Supabase (status ${response.status}).`);
  }
  console.log(`✅ [Supabase API Delete] Item ${id} dihapus dari tabel ${table}`);
  return true;
}
```

- [ ] **Step 3: Ubah return type semua syncXxxToSupabase dari Promise<boolean> ke Promise<any>**

```ts
export async function syncUserToSupabase(user: User): Promise<any> {
  return sendSyncRequest('users', user);
}
// pola sama untuk mahasiswa, alumni, mitra, lowongan, pengajuan_magang, tracer_study, konten_karir
// + tambah baru: syncBeritaToSupabase, syncPengumumanToSupabase, dst sesuai Task 1
```

- [ ] **Step 4: Verifikasi**

Run: `npm run lint`
Expected: PASS, tidak ada TS error soal boolean vs any

- [ ] **Step 5: Commit**

```bash
git add src/services/dbService.ts
git commit -m "feat: sync Supabase throw-on-fail, tanpa silent false"
```

---

### Task 3: data.ts — Supabase-first, localStorage hanya cache

**Files:**
- Modify: `src/data.ts:2237-2340` (getFromDB, saveToDB, insertToDB, updateInDB, deleteInDB)
- Modify: `src/data.ts:2121-2180` (initializeDB)
- Test: `tests/supabase-write.spec.ts`

**Interfaces:**
- Consumes: `sendSyncRequest` baru dari Task 2 (throw-on-fail).
- Produces: `insertToDB(key, item): Promise<T>`, `updateInDB(key, item): Promise<T>`, `saveToDB(key, data): Promise<void>`, `deleteInDB(key, id): Promise<void>` — semua async, reject jika Supabase gagal. `getFromDB` tetap sync tapi HANYA baca MEMORY_DB (tanpa intip localStorage). `initializeDB` tetap async, Supabase sukses = timpa MEMORY_DB, gagal = throw/log tanpa seed menimpa data live.

Mapping key → sync function (wajib lengkap, jangan ada key yang jatuh ke "tidak di-sync"):

```ts
const SYNC_MAP: Record<string, (item: any) => Promise<any>> = {
  users: syncUserToSupabase,
  mahasiswa: syncMahasiswaToSupabase,
  alumni: syncAlumniToSupabase,
  mitra: syncMitraToSupabase,
  lowongan: syncLowonganToSupabase,
  pengajuan_magang: syncPengajuanToSupabase,
  tracer_studies: syncTracerStudyToSupabase,
  konten_karir: syncKontenKarirToSupabase,
  berita: syncBeritaToSupabase,
  pengumuman: syncPengumumanToSupabase,
};
```

- [ ] **Step 1: Sederhanakan getFromDB — hapus intipan localStorage**

```ts
export function getFromDB<T>(key: DBKey): T[] {
  return (MEMORY_DB[key] as T[]) || [];
}
```

Hapus blok `localStorage.getItem('cdc_umk_...')` di getFromDB. Alasan: blok itu bisa menimpa data live Supabase dengan data lokal basi.

- [ ] **Step 2: Ubah saveToDB jadi async Supabase-first**

```ts
export async function saveToDB<T>(key: DBKey, data: T[]): Promise<void> {
  const syncFn = SYNC_MAP[key];
  if (!syncFn) throw new Error(`Tidak ada jalur sync Supabase untuk '${key}'. Tambahkan dulu di SYNC_MAP + server.js.`);
  const saved: T[] = [];
  for (const item of data as any[]) {
    const row = await syncFn(item);
    saved.push((row ?? item) as T);
  }
  MEMORY_DB[key] = saved;
  try {
    localStorage.setItem(`cdc_umk_${key}`, JSON.stringify(saved));
  } catch { /* quota — abaikan, cache saja */ }
}
```

Tidak ada lagi `setTimeout(..., 0)` fire-and-forget. localStorage ditulis SETELAH Supabase sukses, fungsinya cache saja.

- [ ] **Step 3: Ubah insertToDB / updateInDB / deleteInDB jadi async**

```ts
export async function insertToDB<T extends { id: string }>(key: DBKey, item: T): Promise<T> {
  const current = getFromDB<T>(key);
  const syncFn = SYNC_MAP[key];
  if (!syncFn) throw new Error(`Tidak ada jalur sync Supabase untuk '${key}'.`);
  const row = await syncFn(item);
  const finalItem = (row ?? item) as T;
  MEMORY_DB[key] = [finalItem, ...current];
  try { localStorage.setItem(`cdc_umk_${key}`, JSON.stringify(MEMORY_DB[key])); } catch {}
  return finalItem;
}

export async function updateInDB<T extends { id: string }>(key: DBKey, item: T): Promise<T> {
  const syncFn = SYNC_MAP[key];
  if (!syncFn) throw new Error(`Tidak ada jalur sync Supabase untuk '${key}'.`);
  const row = await syncFn(item);
  const finalItem = (row ?? item) as T;
  const current = getFromDB<T>(key);
  const index = current.findIndex(i => i.id === finalItem.id);
  if (index !== -1) current[index] = finalItem;
  else current.push(finalItem);
  MEMORY_DB[key] = [...current];
  try { localStorage.setItem(`cdc_umk_${key}`, JSON.stringify(MEMORY_DB[key])); } catch {}
  return finalItem;
}

export async function deleteInDB<T extends { id: string }>(key: DBKey, id: string): Promise<void> {
  await deleteFromSupabase(key, id);
  MEMORY_DB[key] = getFromDB<T>(key).filter(i => i.id !== id);
  try { localStorage.setItem(`cdc_umk_${key}`, JSON.stringify(MEMORY_DB[key])); } catch {}
}
```

- [ ] **Step 4: Perbaiki initializeDB — jangan seed menimpa data live**

```ts
export async function initializeDB(): Promise<void> {
  const liveData = await fetchInitialDatabaseFromSupabase();
  if (liveData) {
    for (const [key, arr] of Object.entries(liveData)) {
      if (Array.isArray(arr)) MEMORY_DB[key] = arr;
    }
    _dbInitialized = true;
    return;
  }
  const publicData = await fetchPublicDatabase();
  if (publicData) {
    for (const [key, arr] of Object.entries(publicData)) {
      if (Array.isArray(arr)) MEMORY_DB[key] = arr;
    }
  }
  _dbInitialized = true;
}
```

Hapus fallback `DEFAULT_SEEDS → localStorage` dari initializeDB. Kalau backend mati, MEMORY_DB kosong + console warn — UI tampil kosong dengan pesan "backend tidak terjangkau", bukan data seed basi.

- [ ] **Step 5: Perbaiki semua pemanggil (wajib — karena insert/update/delete kini async)**

Cari semua `insertToDB(`, `updateInDB(`, `deleteInDB(`, `saveToDB(` di `src/` (sekitar 40+ titik). Setiap titik diubah dari:

```ts
insertToDB('lowongan', item);
```

menjadi:

```ts
try {
  await insertToDB('lowongan', item);
} catch (err: any) {
  setErrorMsg(err.message || 'Gagal menyimpan ke Supabase.');
  return;
}
```

Fungsi pembungkusnya harus dijadikan `async`. Ini bagian terbesar — lakukan file per file, commit per batch dashboard (Admin, Mitra, Mahasiswa, Layanan).

- [ ] **Step 6: Verifikasi**

Run: `npm run lint`
Expected: PASS — tidak ada lagi "Property 'then' does not exist" atau pemanggil sync ke fungsi async

- [ ] **Step 7: Commit**

```bash
git add src/data.ts src/components/AdminDashboard.tsx src/components/MitraDashboard.tsx src/components/MahasiswaDashboard.tsx
git commit -m "feat: data engine Supabase-first, localStorage hanya cache"
```

---

### Task 4: Register — hapus fallback lokal, gagal backend = gagal register

**Files:**
- Modify: `src/components/Register.tsx:224-330` (handleSubmitAlumni, handleSubmitMitra)
- Test: manual register akun dummy

**Interfaces:**
- Consumes: `registerToBackend` (dbService.ts:150) — POST /register tanpa token, langsung ke Supabase.
- Produces: user baru di tabel Supabase `users` + `mahasiswas/alumnis/mitras`.

Kondisi hari ini: `catch (backendErr)` → kalau network error, jatuh ke `registerUser('alumni', payload)` lokal. Itu yang bikin "akun terdaftar tapi tidak ada di Supabase".

- [ ] **Step 1: Hapus blok fallback di handleSubmitAlumni**

Hapus blok ini (Register.tsx:245-271):

```ts
} catch (backendErr: any) {
  const isNetworkErr = ...;
  if (isNetworkErr) {
    user = registerUser('alumni', payload);
  } else { throw backendErr; }
}
```

Ganti menjadi:

```ts
try {
  user = await registerToBackend({ ... });
} catch (backendErr: any) {
  throw new Error(backendErr.message || 'Pendaftaran gagal. Backend tidak terjangkau — data TIDAK disimpan lokal.');
}
```

- [ ] **Step 2: Lakukan hal yang sama di handleSubmitMitra (Register.tsx:305-325)**

- [ ] **Step 3: Verifikasi manual**

Run: matikan backend (`Ctrl+C` server), coba register → harus muncul error jujur, TIDAK ada user baru yang bisa login.
Run: nyalakan backend, register → cek tabel Supabase `users` bertambah 1 row.

- [ ] **Step 4: Commit**

```bash
git add src/components/Register.tsx
git commit -m "feat: register wajib ke Supabase, hapus fallback lokal"
```

---

### Task 5: Verifikasi akhir — data bertambah di Supabase setiap input

**Files:**
- Create: `scripts/verify_supabase_write.ts`
- Create: `tests/supabase-write.spec.ts`

**Interfaces:**
- Consumes: `API_BASE_URL` dari dbService, JWT admin dari `POST /api/login`.
- Produces: laporan PASS/FAIL per entity.

- [ ] **Step 1: Tulis script verifikasi row-count**

```ts
// scripts/verify_supabase_write.ts
// 1. login admin → token
// 2. hitung COUNT lowongan via GET /api/lowongan
// 3. POST /api/sync/lowongan 1 row dummy bertanda [VERIFY]
// 4. hitung COUNT lagi → harus +1
// 5. DELETE row dummy → COUNT kembali semula
// 6. print PASS/FAIL
```

- [ ] **Step 2: Tulis Playwright spec insert-then-readback**

```ts
// tests/supabase-write.spec.ts
import { test, expect } from '@playwright/test';
test('admin tambah lowongan muncul setelah reload', async ({ page }) => {
  await page.goto('/');
  // login admin via UI, tambah lowongan bertanda [E2E-VERIFY], reload, expect masih ada
});
```

- [ ] **Step 3: Jalankan rangkaian verifikasi**

```bash
npm run lint
npm run build
npx playwright test --project=chromium
npx tsx scripts/verify_supabase_write.ts
```

Expected: lint hijau, build sukses, playwright 5/5 + 1 spec baru hijau, script verify print PASS + COUNT +1 terbukti.

- [ ] **Step 4: Commit**

```bash
git add scripts/verify_supabase_write.ts tests/supabase-write.spec.ts
git commit -m "test: verifikasi setiap input bertambah di Supabase"
```

---

## Self-Review

1. **Spec coverage:** "setiap inputan 100% ke Supabase" → Task 1 (semua entity ada jalur), Task 2 (gagal = throw), Task 3 (tulis Supabase dulu), Task 4 (register tanpa fallback), Task 5 (bukti COUNT +1). Tidak ada input yang tersisa di jalur lokal-saja.
2. **Placeholder scan:** tidak ada TBD/TODO. Semua langkah ada kode konkret + path + line number. Field schema yang belum pasti diberi instruksi cek `prisma/schema.prisma` dulu.
3. **Type consistency:** `sendSyncRequest` berubah ke `Promise<any>` di Task 2, dikonsumsi sebagai `SYNC_MAP` + `await` di Task 3 — konsisten. `insertToDB/updateInDB/deleteInDB/saveToDB` berubah sync→async di Task 3, semua pemanggil diperbaiki di Task 3 Step 5 + Register di Task 4 — konsisten.

## Dampak yang Boss perlu ACC

1. **Offline = input GAGAL dengan pesan error.** Tidak ada lagi "tersimpan lokal". Kalau internet/backend mati, user tidak bisa input sama sekali.
2. **Tanpa login = input privat GAGAL.** Sync butuh JWT. Form tamu (tanpa login) hanya bisa register + baca publik, kecuali Boss minta endpoint publik khusus.
3. **Task 3 Step 5 besar:** ~40+ titik pemanggil insert/update/delete harus dijadikan async + try/catch. Ini sentuhan luas, risiko konflik dengan kerjaan tim di branch lain.
4. **Data lokal lama diabaikan.** localStorage `cdc_umk_*` lama tidak dipakai lagi sebagai sumber — hanya cache. User yang datanya cuma di lokal harus migrasi manual atau dianggap hilang.
5. **Butuh kredensial admin + backend hidup saat verifikasi Task 5.**
