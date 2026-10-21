import { test, expect, type Page } from '@playwright/test';
import { collectErrors, gotoHome, expectClean } from './helpers';

/**
 * QA Sweep 3: Dashboard admin (Chromium, baseURL localhost:3000).
 * Server SUDAH jalan (jangan start server dari spec ini).
 * REPORT-ONLY terhadap src/ — spec ini hanya membaca & mengklik UI.
 *
 * Auth: login REAL butuh kredensial (tidak ada) → pakai bar dev
 * "Pratinjau peran": #fast-auth-admin masuk, #fast-auth-public keluar.
 * Klik → #dashboard-panel-resolver muncul (App.tsx handleFastRoleSwitch).
 *
 * MENU (AdminDashboard.tsx:685-718, tombol #adm-tab-<id>), 16 item:
 *  ringkasan, konten, mitra, media-sosial, komentar, statistik-beranda,
 *  hero-slider, keanggotaan, visi-misi, sk-cdc, kalender, laporan,
 *  mou, galeri, konseling, admin.
 * Grup MANAJEMEN WEB collapsible tapi default TERBUKA (expandedGroups ?? true).
 *
 * ATURAN DATA (ketat):
 * - JANGAN create/edit/delete data asli. JANGAN klik Simpan pada config
 *   (statistik, hero slides, dsb) — cukup verifikasi form/config tampil.
 * - Tombol hapus (semua pakai window.confirm native): klik → dialog
 *   tercatat → DISMISS (Cancel) → screenshot → verifikasi NOL penghapusan.
 *   Hanya tombol berteks "Hapus" yang disentuh; Setujui/Tolak (mutasi
 *   langsung tanpa confirm) TIDAK diklik.
 * - Jangan navigasi eksternal.
 */

test.describe.configure({ timeout: 60_000 });

const MENUS: { id: string; keyword: string }[] = [
  { id: 'ringkasan', keyword: 'Ringkasan Laporan' },
  { id: 'konten', keyword: 'Konten Karir' },
  { id: 'mitra', keyword: 'Manajemen Mitra' },
  { id: 'media-sosial', keyword: 'Media Sosial' },
  { id: 'komentar', keyword: 'Moderasi Komentar' },
  { id: 'statistik-beranda', keyword: 'Statistik Beranda' },
  { id: 'hero-slider', keyword: 'Hero Slider' },
  { id: 'keanggotaan', keyword: 'Keanggotaan' },
  { id: 'visi-misi', keyword: 'Visi' },
  { id: 'sk-cdc', keyword: 'Surat Keputusan' },
  { id: 'kalender', keyword: 'Kalender Kegiatan' },
  { id: 'laporan', keyword: 'Laporan Kinerja' },
  { id: 'mou', keyword: 'MOU' },
  { id: 'galeri', keyword: 'Galeri' },
  { id: 'konseling', keyword: 'Konseling' },
  { id: 'admin', keyword: 'Administrator' },
];

const kw = (id: string) => MENUS.find((m) => m.id === id)!.keyword;

/** Masuk dashboard admin via bar dev. */
async function loginAdmin(page: Page): Promise<void> {
  await gotoHome(page);
  const btn = page.locator('#fast-auth-admin');
  await expect(btn, '#fast-auth-admin harus ada (bar Pratinjau peran)').toBeVisible({ timeout: 15000 });
  await btn.scrollIntoViewIfNeeded().catch(() => {});
  await btn.click();
  await expect(page.locator('#dashboard-panel-resolver'), 'dashboard harus muncul').toBeVisible({
    timeout: 25000,
  });
  await expect(page.locator('#admin-dashboard'), 'AdminDashboard harus render').toBeVisible({
    timeout: 25000,
  });
}

/** Buka satu item MENU, verifikasi panel render (keyword + konten non-blank). */
async function openAdmTab(page: Page, id: string, keyword: string): Promise<void> {
  if (id === 'konseling') {
    const kontenBtn = page.locator('#adm-tab-konten');
    await kontenBtn.scrollIntoViewIfNeeded().catch(() => {});
    await kontenBtn.click();
    await page.waitForTimeout(500);
  }
  const btn = page.locator(`#adm-tab-${id}`);
  await btn.scrollIntoViewIfNeeded().catch(() => {});
  await expect(btn, `tombol menu #adm-tab-${id} harus terlihat`).toBeVisible({ timeout: 15000 });
  await btn.click();
  await page.waitForTimeout(900);
  const dash = page.locator('#admin-dashboard');
  await expect(
    dash.getByText(keyword, { exact: false }).first(),
    `panel "${id}" harus memuat teks "${keyword}"`,
  ).toBeVisible({ timeout: 15000 });
  const text = ((await dash.innerText().catch(() => '')) || '').trim();
  expect(text.length, `panel "${id}" blank/kosong`).toBeGreaterThan(50);
}

/**
 * Probe tombol hapus: klik tombol "Hapus" pertama yang terlihat → dialog
 * confirm native HARUS muncul → dismiss (Cancel) → screenshot.
 * Return 'DIALOG-CANCEL' | 'NO-BUTTON' | 'NO-DIALOG'.
 * NOL penghapusan: dismiss = confirm() false → handler delete tidak jalan;
 * diverifikasi via jumlah tombol Hapus yang tidak berkurang.
 */
async function probeDelete(page: Page, tabId: string, dialogs: string[]): Promise<string> {
  const scope = page.locator('#admin-dashboard');
  const anyBtn = scope
    .locator('button', { hasText: 'Hapus' })
    .or(scope.locator('button[title^="Hapus"]'));
  const nAny = await anyBtn.count().catch(() => 0);
  if (nAny === 0) return 'NO-BUTTON';
  // Lewati tombol disabled (mis. proteksi hapus-akun-sendiri di tab admin) —
  // klik tombol disabled = timeout sia-sia.
  const delBtn = scope
    .locator('button:not([disabled])', { hasText: 'Hapus' })
    .or(scope.locator('button[title^="Hapus"]:not([disabled])'));
  const n = await delBtn.count().catch(() => 0);
  if (n === 0) return `ALL-DISABLED(${nAny} tombol Hapus nonaktif)`;
  const before = dialogs.length;
  const countBefore = n;
  await delBtn.first().scrollIntoViewIfNeeded().catch(() => {});
  await delBtn.first().click({ timeout: 8000 });
  await page.waitForTimeout(900);
  if (dialogs.length > before) {
    await page.screenshot({ path: `test-results/admin-hapus-${tabId}.png` }).catch(() => {});
    const countAfter = await delBtn.count().catch(() => -1);
    expect(countAfter, `data tab "${tabId}" BERUBAH setelah Cancel!`).toBe(countBefore);
    return `DIALOG-CANCEL("${dialogs[dialogs.length - 1].slice(0, 80)}")`;
  }
  return 'NO-DIALOG';
}

function armDialogTrap(page: Page): string[] {
  const dialogs: string[] = [];
  page.on('dialog', async (d) => {
    dialogs.push(d.message());
    await d.dismiss().catch(() => {});
  });
  return dialogs;
}

test.describe('QA Sweep 3a: ringkasan (grafik 3 mode) + konten + mitra', () => {
  test('ringkasan render, grafik harian/mingguan/bulanan, konten+mitra render', async ({ page }) => {
    test.setTimeout(60_000);
    const get = await collectErrors(page);
    const dialogs = armDialogTrap(page);
    await loginAdmin(page);

    // ── ringkasan ──
    await openAdmTab(page, 'ringkasan', kw('ringkasan'));
    await expect(page.locator('#adm-stat-cards'), 'kartu statistik harus ada').toBeVisible({
      timeout: 10000,
    });
    // Grafik frekuensi: 3 mode interval (AdminDashboard.tsx:2261-2263)
    for (const mode of ['14 Hari', '12 Minggu', '6 Bulan']) {
      const modeBtn = page.locator('#admin-dashboard').getByRole('button', { name: mode });
      await expect(modeBtn, `tombol mode grafik "${mode}" harus ada`).toBeVisible({ timeout: 10000 });
      await modeBtn.click();
      await page.waitForTimeout(700);
      const dashText = ((await page.locator('#admin-dashboard').innerText().catch(() => '')) || '').trim();
      expect(dashText.length, `panel blank setelah ganti mode "${mode}"`).toBeGreaterThan(50);
    }
    await expect(
      page.locator('#admin-dashboard').getByText('Frekuensi Publikasi', { exact: false }).first(),
      'judul grafik frekuensi harus tetap ada',
    ).toBeVisible({ timeout: 10000 });
    console.log('[admin-sweep] tab=ringkasan render=OK grafik=3-mode-OK');

    // ── konten + mitra ──
    for (const id of ['konten', 'mitra']) {
      await openAdmTab(page, id, kw(id));
      const hapus = await probeDelete(page, id, dialogs);
      console.log(`[admin-sweep] tab=${id} render=OK hapus=${hapus}`);
    }
    expectClean(get());
  });
});

test.describe('QA Sweep 3b: media-sosial + komentar + statistik-beranda + hero-slider', () => {
  test('4 panel interaksi-publik & web render; config tampil tanpa save', async ({ page }) => {
    test.setTimeout(60_000);
    const get = await collectErrors(page);
    const dialogs = armDialogTrap(page);
    await loginAdmin(page);

    for (const id of ['media-sosial', 'komentar', 'statistik-beranda', 'hero-slider']) {
      await openAdmTab(page, id, kw(id));
      // Config/save: JANGAN klik Simpan — cukup pastikan form/config tampil.
      if (id === 'statistik-beranda' || id === 'media-sosial' || id === 'visi-misi') {
        const inputs = page.locator('#admin-dashboard').locator('input, textarea, select');
        expect(await inputs.count(), `form config "${id}" harus tampil`).toBeGreaterThan(0);
      }
      const hapus = await probeDelete(page, id, dialogs);
      console.log(`[admin-sweep] tab=${id} render=OK hapus=${hapus}`);
    }
    expectClean(get());
  });
});

test.describe('QA Sweep 3c: keanggotaan + visi-misi + sk-cdc + kalender', () => {
  test('4 panel manajemen-web render + probe hapus', async ({ page }) => {
    test.setTimeout(60_000);
    const get = await collectErrors(page);
    const dialogs = armDialogTrap(page);
    await loginAdmin(page);

    for (const id of ['keanggotaan', 'visi-misi', 'sk-cdc', 'kalender']) {
      await openAdmTab(page, id, kw(id));
      if (id === 'visi-misi') {
        const inputs = page.locator('#admin-dashboard').locator('input, textarea, select');
        expect(await inputs.count(), 'form visi-misi (upload/URL) harus tampil').toBeGreaterThan(0);
      }
      const hapus = await probeDelete(page, id, dialogs);
      console.log(`[admin-sweep] tab=${id} render=OK hapus=${hapus}`);
    }
    expectClean(get());
  });
});

test.describe('QA Sweep 3d: laporan + mou + galeri + konseling + admin', () => {
  test('5 panel sisa render + probe hapus', async ({ page }) => {
    test.setTimeout(60_000);
    const get = await collectErrors(page);
    const dialogs = armDialogTrap(page);
    await loginAdmin(page);

    for (const id of ['laporan', 'mou', 'galeri', 'konseling', 'admin']) {
      await openAdmTab(page, id, kw(id));
      const hapus = await probeDelete(page, id, dialogs);
      console.log(`[admin-sweep] tab=${id} render=OK hapus=${hapus}`);
    }
    expectClean(get());
  });
});

test.describe('QA Sweep 3e: logout → publik', () => {
  test('#fast-auth-public kembali ke tampilan publik', async ({ page }) => {
    test.setTimeout(60_000);
    const get = await collectErrors(page);
    await loginAdmin(page);
    await expect(page.locator('#dashboard-panel-resolver')).toBeVisible({ timeout: 15000 });

    const pubBtn = page.locator('#fast-auth-public');
    await expect(pubBtn, '#fast-auth-public harus ada').toBeVisible({ timeout: 10000 });
    await pubBtn.scrollIntoViewIfNeeded().catch(() => {});
    await pubBtn.click();
    await expect(page.locator('#site-header'), 'header publik harus kembali').toBeVisible({
      timeout: 15000,
    });
    await expect(page.locator('#dashboard-panel-resolver')).toBeHidden();
    console.log('[admin-sweep] logout→publik OK');
    expectClean(get());
  });
});
