# QA Testing Menyeluruh Semua Tombol — Portal CDC UMK Kendari

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Klik & uji SEMUA tombol/link/form di Portal CDC, catat mana berfungsi mana ngebug, hasilkan laporan bug tanpa mengubah source code.

**Architecture:** Playwright scripted click-sweep per area (Chromium only) + capture console error & network 4xx/5xx per halaman. Mode REPORT-ONLY: tidak ada fix, tidak ada commit source. Tombol destruktif (hapus) hanya diuji sampai dialog konfirmasi muncul lalu CANCEL.

**Tech Stack:** Playwright 1.62.1 (chromium, sudah terinstal), server yang SUDAH jalan (Vite :3000, Express :5000), tanpa webServer spawn.

**Spec:** Permintaan Boss 15 Sep 2026 — "tekan2 semua tombol agar tau mana yang berfungsi mana yang tidak, yang tidak berfungsi atau ngebug laporkan".

## Global Constraints

- REPORT-ONLY: jangan edit/patch source code apapun. Satu-satunya file baru yang boleh dibuat: file test Playwright sementara + file laporan.
- Server dev SUDAH jalan (port 3000 & 5000 LISTENING). Jangan start server baru. Jangan `npm run dev`.
- Chromium only (`--project=chromium`). Jangan run firefox/webkit (3x waktu, temuan sama).
- Waspada rate limit backend (jebakan 429): loginLimiter max 5x/15 mnt, apiLimiter 100x/mnt, registerLimiter 10x/15 mnt. Test login REAL maksimal 3x submit. Untuk dashboard pakai bar "Pratinjau peran" (fast-auth-*) — itu backdoor dev yang memang ada.
- Tombol hapus/decline/deactivate: JANGAN konfirmasi. Verifikasi dialog muncul → screenshot → cancel/Escape.
- `.env` jangan dibaca isinya, jangan diprint. Cek key names saja bila perlu.
- Tiap area selesai → screenshot bukti tersimpan di `tools/qa-sweep/screenshots/`.

---

### Task 1: Scaffolding + Smoke Test

**Files:**
- Create: `tools/qa-sweep/sweep.spec.ts`
- Create: `tools/qa-sweep/helpers.ts`
- Test: `npx playwright test --project=chromium tools/qa-sweep/sweep.spec.ts`

**Interfaces:**
- Consumes: server jalan di localhost:3000 (frontend) & :5000 (backend via proxy /api).
- Produces: `helpers.ts` mengekspor `collectErrors(page)` → `{ consoleErrors: string[], badRequests: string[] }` dipakai semua task berikut.

- [ ] **Step 1: Buat helpers.ts** — fixture pengumpul console error + request gagal:

```ts
import { Page } from '@playwright/test';
export interface SweepResult { consoleErrors: string[]; badRequests: string[]; }
export async function collectErrors(page: Page): Promise<() => SweepResult> {
  const res: SweepResult = { consoleErrors: [], badRequests: [] };
  page.on('console', m => { if (m.type() === 'error') res.consoleErrors.push(m.text().slice(0, 300)); });
  page.on('response', r => { if (r.status() >= 400) res.badRequests.push(`${r.status()} ${r.url().slice(0, 150)}`); });
  return () => res;
}
export function filterNoise(r: SweepResult): SweepResult {
  // buang noise analytics / third-party bila ada
  return r;
}
```

- [ ] **Step 2: Buat sweep.spec.ts kerangka + 1 smoke test homepage**:

```ts
import { test, expect } from '@playwright/test';
import { collectErrors } from './helpers';
test('smoke: homepage load tanpa error kritis', async ({ page }) => {
  const get = await collectErrors(page);
  await page.goto('/');
  await expect(page.locator('#root')).toBeVisible();
  const r = get();
  expect(r.consoleErrors, JSON.stringify(r.consoleErrors)).toEqual([]);
});
```

- [ ] **Step 3: Run smoke test, expect PASS**:

Run: `npx playwright test --project=chromium tools/qa-sweep/sweep.spec.ts`
Expected: 1 passed. Jika homepage saja sudah console error → catat sebagai BUG-000, lanjutkan.

---

### Task 2: Bar Pratinjau Peran + Navigasi Header (Publik)

**Files:**
- Modify: `tools/qa-sweep/sweep.spec.ts` (tambah describe baru)
- Test: run file yang sama

**Interfaces:**
- Consumes: `collectErrors` dari Task 1.
- Produces: daftar tab publik yang verified (dipakai Task 3 sebagai daftar halaman yang harus dirender tanpa error).

- [ ] **Step 1: Test 4 tombol role switcher** — klik `#fast-auth-admin`, `#fast-auth-mitra`, `#fast-auth-user`, `#fast-auth-public` satu per satu; tiap klik expect `#dashboard-panel-resolver` visible (kecuali public → expect PublicLayout/header visible). Kembali ke public tiap selesai.

- [ ] **Step 2: Test menu header desktop** — tiap item NAV_ITEMS (src/components/Header.tsx:49-152): Beranda; Tentang Kami → Profil → Visi-Misi, Keanggotaan, SK-CDC, Kalender, Laporan, MOU, Galeri; Layanan → berita, konseling, workshop, softskill, seminar, career-fair, campus-hiring, magang (+ link eksternal Klob cukup cek href benar, jangan navigasi keluar); Tracer Study (2 link eksternal cek href); Simbelmawa (5 link eksternal cek href); Prestasi 6 tab (internasional/nasional/wilayah x akademik/non-akademik); Register → register-alumni & register-perusahaan; Job Info → lowongan (+ APSKAR cek href); tombol Login; toggle bahasa ID/EN; TOP_LINKS (ICCN, UM Kendari, SIMBELMAWA, SIMKATMAWA, MTQMN — MTQMN href kosong, sudah dicurigai mati).
- Kriteria PASS per tab internal: konten tab render (tidak blank), tidak ada console error baru, tidak ada request 4xx/5xx baru. Link eksternal: PASS bila `href` non-kosong & format URL valid.

- [ ] **Step 3: Test menu mobile** — viewport 375px: tombol hamburger buka/tutup, tiap parent menu expand, klik 1 child (mis. lowongan) → tab kebuka. Cek tidak ada overflow horizontal (`document.scrollingElement.scrollWidth <= 390`).

- [ ] **Step 4: Run + catat**: Run: `npx playwright test --project=chromium tools/qa-sweep/sweep.spec.ts`
Expected: semua hijau; tiap kegagalan → 1 baris di laporan (ID BUG-xxx, langkah repro, expected vs actual, screenshot).

---

### Task 3: Beranda + Pencarian Lowongan + Detail

**Files:**
- Modify: `tools/qa-sweep/sweep.spec.ts`
- Test: run file yang sama

- [ ] **Step 1: HeroSlider** — tombol prev/next/dots (3 tombol di HeroSlider.tsx), CTA hero; expect slide berganti (atribut/index berubah), CTA navigasi benar.

- [ ] **Step 2: Kartu lowongan & berita beranda** — klik 1 kartu lowongan → JobDetail render (judul, perusahaan, tombol Lamar & Kembali). Tombol Kembali → balik daftar. Klik 1 kartu berita → BeritaDetailView render + tombol kembali. Klik 1 program/pengumuman → panel `#program-detail-panel` + `#program-back-btn` kembali.

- [ ] **Step 3: JobSearchMasterDetail (tab lowongan)** — isi search keyword, pilih filter provinsi (INDONESIAN_PROVINCES), pilih spesialisasi (JOB_SPECIALIZATIONS), ganti sort, pindah halaman pagination; tiap aksi expect daftar berubah/tetap render tanpa error. Klik 1 hasil → detail.

- [ ] **Step 4: Tombol Lamar sebagai publik** — expect redirect ke login (App.tsx onApply → handleNavigateToLogin). Jangan submit lamaran sungguhan di task ini.

- [ ] **Step 5: SocialShareBar + Footer** — tombol share (WA/FB/X/copy-link) cukup verifikasi href/dialog muncul; tiap link footer internal navigasi benar; link eksternal cek href.

- [ ] **Step 6: Run + catat** seperti Task 2 Step 4.

---

### Task 4: Auth — Login, Register, Logout

**Files:**
- Modify: `tools/qa-sweep/sweep.spec.ts`
- Test: run file yang sama

**Interfaces:**
- Consumes: halaman login/register dicapai via tombol header (Task 2).
- Produces: sesi login mitra & mahasiswa (via 1x login REAL per peran, hemat kuota rate limit) untuk Task 5–6. Jika login real kena 429 → STOP task ini, catat BUG rate-limit, pakai fast-auth untuk task lanjut.

- [ ] **Step 1: Login invalid** — submit email salah + password salah → expect pesan error tampil, tetap di halaman login. (1 hit rate limit)

- [ ] **Step 2: Login valid 1 akun** — pakai 1 kredensial seed/test yang Boss berikan (JANGAN hardcode password asli di file test bila repo di-push; minta Boss kredensial via chat, pakai env lokal `QA_EMAIL`/`QA_PASS`). Expect masuk dashboard sesuai role. Logout → kembali publik.

- [ ] **Step 3: Register** — tab alumni & perusahaan berganti; submit form kosong → expect error validasi per field; submit email format salah → error; (opsional, bila Boss izinkan) 1x submit data dummy valid → expect sukses/pending. Total submit ≤ 3 (hemat registerLimiter 10x/15mnt).

- [ ] **Step 4: GoogleAuthModal** — bila tombol Google login ada: klik → modal terbuka; cukup verifikasi modal render (jangan selesaikan OAuth sungguhan).

- [ ] **Step 5: Run + catat.**

---

### Task 5: Dashboard Mahasiswa/Alumni (login)

**Files:**
- Modify: `tools/qa-sweep/sweep.spec.ts`
- Test: run file yang sama

- [ ] **Step 1: Masuk via fast-auth-user** — 10 tombol MahasiswaDashboard: navigasi tiap section, tombol Lamar di 1 lowongan (JobApplicationModal terbuka → isi → CANCEL dulu untuk cek validasi; submit sungguhan 1x bila aman), edit profil (ubah field non-kritis → simpan → verifikasi tersimpan → kembalikan), TracerStudyForm (isi → CANCEL, jangan submit ganda), tombol logout.

- [ ] **Step 2: StudentApplicationsView + StudentProfileView** — tiap tab/filter/pagination diklik; aplikasi yang dilamar tampil; tombol batalkan (bila ada) hanya sampai dialog konfirmasi → CANCEL.

- [ ] **Step 3: Run + catat.**

---

### Task 6: Dashboard Mitra (login)

**Files:**
- Modify: `tools/qa-sweep/sweep.spec.ts`
- Test: run file yang sama

- [ ] **Step 1: Masuk via fast-auth-mitra** — 72 tombol MitraDashboard: CRUD lowongan (create 1 lowongan DUMMY bertanda `[QA-TEST]` → edit → unpublish → DELETE dummy itu juga sebagai bukti hapus berfungsi; ini satu-satunya penghapusan yang diizinkan karena data milik sendiri), lihat pelamar per lowongan, ubah status pelamar (1x lalu kembalikan), edit profil perusahaan, logout.

- [ ] **Step 2: HiringCriteriaModal + JobApplicationModal (sisi mitra)** — buka/tutup, simpan kriteria.

- [ ] **Step 3: Run + catat.**

---

### Task 7: Dashboard Admin (login) — area terbesar (171 tombol)

**Files:**
- Modify: `tools/qa-sweep/sweep.spec.ts`
- Test: run file yang sama

- [ ] **Step 1: Masuk via fast-auth-admin** — tiap modul: CRUD users (create user dummy → edit → nonaktifkan → HAPUS dummy sendiri; user seed JANGAN dihapus), CRUD lowongan, CRUD konten/berita (konten_karir jenis berita & program), CRUD pengumuman, verifikasi/publish, statistik/config (catat bila save localStorage-only sesuai memori: 16 fungsi save* — verifikasi satu per satu apakah nembak API atau localStorage), hero slides, galeri, laporan/tracer data, tombol reload/sync, logout.

- [ ] **Step 2: Tombol hapus admin** — SEMUA hanya sampai dialog konfirmasi → screenshot → CANCEL. Nol penghapusan data asli.

- [ ] **Step 3: Run + catat.** File ini besar (AdminDashboard 500KB+), beri timeout 60s per test, workers=1 (sudah di config).

---

### Task 8: Halaman Layanan Satu per Satu (publik)

**Files:**
- Modify: `tools/qa-sweep/sweep.spec.ts`
- Test: run file yang sama

- [ ] **Step 1: Uji tiap halaman**: konseling, workshop, softskill, seminar, career-fair, campus-hiring, magang, keanggotaan (Keanggotaan.tsx), kalender (KalenderKegiatanView), laporan (LaporanKinerjaView), mou (MouStakeholderView), galeri (GaleriView + lightbox/zoom bila ada), sk-cdc (SuratKeputusanView), visi-misi, profil, berita list + pagination, prestasi 6 tab, EventDetailView, TracerStudyForm publik (bila bisa diakses publik: isi → CANCEL).
- Kriteria: tiap tombol/filter/pagination/CTA dalam halaman diklik; PASS bila merespons benar tanpa console error & tanpa request gagal.

- [ ] **Step 2: Run + catat.**

---

### Task 9: Laporan Bug Final

**Files:**
- Create: `docs/QA-SWEEP-2026-09-15.md` (laporan utama untuk Boss)
- Test: tidak ada (baca ulang + verifikasi nomor)

- [ ] **Step 1: Kompilasi laporan** — format per bug: ID (BUG-001…), Lokasi (file:line bila ketahuan), Langkah repro 1-2-3, Expected vs Actual, screenshot path, Severity (Kritis/Tinggi/Sedang/Rendah). Plus tabel rekapitulasi: total tombol diuji, PASS count, FAIL count per area (Publik/Auth/Mahasiswa/Mitra/Admin/Layanan). Plus temuan non-tombol yang terlihat (contoh: MTQMN href kosong Header.tsx:162; fallback dummy "JOB PREPARATION 2026" App.tsx:210-221; FAST_AUTH_ENABLED=true permanen App.tsx:118).

- [ ] **Step 2: Self-review** — (1) Spec coverage: semua area Task 2–8 ada di laporan? (2) Tiap FAIL ada screenshot + repro? (3) Tidak ada klaim tanpa bukti (log/screenshot)? Perbaiki yang kurang.

- [ ] **Step 3: Sampaikan ke Boss** — ringkasan chat: total diuji, berapa rusak, 3 bug paling kritis, path file laporan. TANYA: mau langsung perbaiki yang kritis, atau Boss review dulu.

## Self-Review (checklist pekerja)

1. Spec coverage: Task 2 (navigasi) → Task 8 (layanan) mencakup semua tombol di 30 file onClick + 171 tombol admin. Tidak ada area yang kelewat.
2. Placeholder scan: semua step ada perintah run + expected konkret. Tidak ada TBD/TODO.
3. Type consistency: `collectErrors` dipakai konsisten di semua task; penamaan BUG-xxx konsisten di laporan.
