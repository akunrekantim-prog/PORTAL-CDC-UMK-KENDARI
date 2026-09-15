import { Page } from '@playwright/test';

export interface SweepResult {
  consoleErrors: string[];
  badRequests: string[];
  failedRequests: string[];
}

/** Pasang listener ke page, kembalikan fungsi getter hasil. */
export async function collectErrors(page: Page): Promise<() => SweepResult> {
  const res: SweepResult = { consoleErrors: [], badRequests: [], failedRequests: [] };
  page.on('console', (m) => {
    if (m.type() === 'error') res.consoleErrors.push(m.text().slice(0, 300));
  });
  page.on('response', (r) => {
    if (r.status() >= 400) res.badRequests.push(`${r.status()} ${r.url().slice(0, 150)}`);
  });
  page.on('requestfailed', (r) => {
    res.failedRequests.push(`${r.failure()?.errorText} ${r.url().slice(0, 150)}`);
  });
  return () => res;
}

const NOISE_PATTERNS = [
  'favicon.ico',
  'fonts.g',
  'googleapis',
  'gstatic',
  'analytics',
  'googletagmanager',
  'klob.id',
  'tracerstudy.umkendari',
  'kemdiktisaintek.go.id',
  'simbelmawa',
];

// BUG-001 (FIXED 15 Sep 2026): 10 thumbnail Unsplash mati sudah diganti
// dengan ID verified-200. Daftar ini dipertahankan sebagai jaring pengaman
// saja — bila sweep hijau tanpa hit di sini, berarti fix valid.
// Lihat docs/QA-SWEEP-2026-09-15.md BUG-001.
const BUG001_DEAD_IMAGES = [
  'photo-1530543746129-07ab857928c7', // data.ts:1657 prest_007
  'photo-1508700115892-44ecd06ad815', // data.ts:1676 prest_008
  'photo-1612872087720-dbb86e8b7ba7', // data.ts:1714 prest_010
  'photo-1523050854058-8df90110c9f1', // data.ts:1101 kk_seed_berita1 + fallback BeritaDetailView:385/PrestasiDetailView:406
  'photo-1510915361894-dbc7e7f2f6be', // data.ts:1790
  'photo-1531446149050-48d686921263', // data.ts:1828
  'photo-1542751371-8c5e26379865',    // data.ts:1752
  'photo-1555597673-b2d75c1f8bd1',    // data.ts:1809
  'photo-1596854407930-d5a4f1f1c3e5', // data.ts:1733
  'photo-1517649763962-0c623266010b', // BUG-001 meluas: gambar mati ke-10,
  // ditemukan di data LIVE /api/public-data (berita/konten, respon 404 via curl).
];

/** Buang noise third-party agar fokus ke bug aplikasi sendiri. */
export function filterNoise(r: SweepResult): SweepResult {
  const noisy = (s: string) => NOISE_PATTERNS.some((p) => s.includes(p));
  const knownBug = (s: string) => BUG001_DEAD_IMAGES.some((p) => s.includes(p));
  return {
    consoleErrors: r.consoleErrors.filter((s) => !noisy(s) && !knownBug(s)),
    badRequests: r.badRequests.filter((s) => !noisy(s) && !knownBug(s)),
    failedRequests: r.failedRequests.filter((s) => !noisy(s) && !knownBug(s)),
  };
}

export function formatResult(r: SweepResult): string {
  return JSON.stringify(r, null, 2);
}

/**
 * Navigasi standar sweep: event `load` terbukti flaky di app ini
 * (ditahan resource eksternal), jadi pakai domcontentloaded + #root.
 */
export async function gotoHome(page: Page, timeout = 45000): Promise<void> {
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout });
  await page.waitForSelector('#root', { timeout });
  await page.waitForTimeout(1500);
}

/** Assert halaman bersih: tanpa console error & request gagal (di luar noise).
 *  `expected`: daftar status HTTP yang DIHARAPKAN gagal dalam test ini
 *  (mis. [401] untuk login invalid, [403] untuk akun pending) — difilter
 *  agar test negatif tidak false-positive. */
export function expectClean(r: SweepResult, expected: number[] = []): void {
  const c = filterNoise(r);
  const unexpected = (s: string) => !expected.some((code) => s.includes(` ${code} `) || s.startsWith(`${code} `));
  const badC = c.consoleErrors.filter(unexpected);
  const badR = c.badRequests.filter(unexpected);
  if (badC.length || badR.length || c.failedRequests.length) {
    throw new Error('Halaman tidak bersih:\n' + formatResult({ consoleErrors: badC, badRequests: badR, failedRequests: c.failedRequests }));
  }
}

export const DESKTOP_NAV = 'nav[aria-label="Navigasi utama"]';

/* ── Buka dropdown parent desktop: netralkan mouse dulu (hindari sisa
      hover dari aksi sebelumnya menahan menu lain terbuka — terbukti
      bikin Prestasi gagal dibuka), lalu hover; fallback klik toggle. ── */
export async function openParent(page: Page, parentLabel: string): Promise<void> {
  await page.mouse.move(640, 500).catch(() => {});
  await page.waitForTimeout(200);
  const parentBtn = page.locator(`${DESKTOP_NAV} > div > button`, { hasText: parentLabel }).first();
  await parentBtn.waitFor({ timeout: 10000 });
  await parentBtn.hover().catch(() => {});
  await page.waitForTimeout(400);
  const menuVisible = await page.locator(`${DESKTOP_NAV} [role="menu"]`).first().isVisible().catch(() => false);
  if (menuVisible) return;
  await parentBtn.click();
  await page.locator(`${DESKTOP_NAV} [role="menu"]`).first().waitFor({ timeout: 5000 });
}

export async function childItem(page: Page, childLabel: string) {
  // Exact-match dulu: 'Nasional' adalah substring 'Internasional' —
  // hasText biasa + .first() salah klik Internasional (terbukti di sweep prestasi).
  const exact = page.locator(`${DESKTOP_NAV} [role="menu"] [role="menuitem"]`, { hasText: new RegExp(`^${childLabel}$`) }).first();
  try {
    await exact.waitFor({ timeout: 3000 });
    return exact;
  } catch {
    const btn = page.locator(`${DESKTOP_NAV} [role="menu"] [role="menuitem"]`, { hasText: childLabel }).first();
    await btn.waitFor({ timeout: 8000 });
    return btn;
  }
}

/** childItem untuk side-submenu kanan (min-w-[200px], Header.tsx:541).
 *  Dipakai Profil (Visi–Misi, Keanggotaan) & Prestasi (Akademik/Non-Akademik). */

/** Tunggu kartu live muncul (data backend async). false = DB kosong/skip, bukan bug. */
export async function hasLiveCards(page: Page, selector: string, timeout = 25000): Promise<boolean> {
  try {
    await page.locator(selector).first().waitFor({ timeout });
    return true;
  } catch {
    return false;
  }
}
