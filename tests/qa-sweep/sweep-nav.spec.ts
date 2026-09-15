import { test, expect, type Page } from '@playwright/test';
import { collectErrors, gotoHome, expectClean } from './helpers';

/**
 * QA Sweep 1: Navigasi — role switcher, menu desktop, bahasa, mobile.
 * Chromium, baseURL http://localhost:3000 (playwright.config.ts).
 * REPORT-ONLY — tidak mengubah src/ maupun server. Tidak menjalankan test.
 *
 * Peta menu disalin dari src/components/Header.tsx (NAV_ITEMS + TOP_LINKS).
 */

const DESKTOP_NAV = 'nav[aria-label="Navigasi utama"]';
const MOBILE_DRAWER = '#mobile-nav-drawer';
const LANG_TOGGLE = 'button[title="Pilih Bahasa / Change Language"]';

/* ── Buka dropdown parent desktop: netralkan mouse dulu (hindari sisa
      hover dari aksi sebelumnya menahan menu lain terbuka — terbukti
      bikin Prestasi gagal dibuka di run awal), lalu hover; fallback klik. ── */
async function openParent(page: Page, parentLabel: string): Promise<void> {
  await page.mouse.move(640, 500).catch(() => {});
  await page.waitForTimeout(200);
  const parentBtn = page.locator(`${DESKTOP_NAV} > div > button`, { hasText: parentLabel }).first();
  await expect(parentBtn, `menu parent "${parentLabel}" harus terlihat di desktop`).toBeVisible({ timeout: 10000 });
  await parentBtn.hover().catch(() => {});
  const menu = page.locator(`${DESKTOP_NAV} [role="menu"]`).first();
  if (await menu.isVisible().catch(() => false)) return;
  await parentBtn.click();
  await expect(menu, `dropdown "${parentLabel}" harus terbuka`).toBeVisible({ timeout: 5000 });
}

async function childItem(page: Page, childLabel: string) {
  const btn = page.locator(`${DESKTOP_NAV} [role="menu"] [role="menuitem"]`, { hasText: childLabel }).first();
  await expect(btn, `child "${childLabel}" harus terlihat di dropdown`).toBeVisible({ timeout: 5000 });
  return btn;
}

/* Stub window.open agar klik link eksternal TIDAK navigasi keluar,
   tapi URL yang dibuka tetap bisa diverifikasi. */
async function stubWindowOpen(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as unknown as Record<string, unknown>;
    w.__openedUrl = null;
    window.open = ((url?: string | URL) => {
      w.__openedUrl = String(url);
      return null;
    }) as typeof window.open;
  });
}

async function lastOpenedUrl(page: Page): Promise<string | null> {
  return page.evaluate(() => (window as unknown as Record<string, unknown>).__openedUrl as string | null);
}

function assertValidUrl(url: string, label: string): void {
  expect(url, `"${label}" href tidak boleh kosong`).toBeTruthy();
  const parsed = new URL(url); // throw bila format tidak valid
  expect(['http:', 'https:'].includes(parsed.protocol), `"${label}" harus http(s): ${url}`).toBe(true);
  expect(parsed.host.includes('.'), `"${label}" host tidak valid: ${url}`).toBe(true);
}

/* Verifikasi generik konten tab internal ter-render (tetap di view publik). */
async function expectTabRendered(page: Page, tabName: string): Promise<void> {
  await expect(page.locator('#site-header'), `header hilang setelah navigasi "${tabName}"`).toBeVisible({
    timeout: 10000,
  });
  const viewport = page.locator('#core-viewport');
  await expect(viewport, `core-viewport hilang setelah navigasi "${tabName}"`).toBeVisible({ timeout: 10000 });
  const text = ((await viewport.innerText().catch(() => '')) || '').trim();
  expect(text.length, `konten "${tabName}" kosong`).toBeGreaterThan(20);
}

test.describe('QA Sweep 1a: Role switcher dev (#fast-auth-*)', () => {
  test('4 tombol role → dashboard muncul, tiap selesai kembali ke public', async ({ page }) => {
    const get = await collectErrors(page);
    await gotoHome(page);
    await expect(page.locator('#site-header'), 'header publik harus ada').toBeVisible({ timeout: 15000 });

    const roles = ['admin', 'mitra', 'user'] as const;
    for (const id of roles) {
      const btn = page.locator(`#fast-auth-${id}`);
      await expect(btn, `#fast-auth-${id} harus ada`).toBeVisible({ timeout: 10000 });
      await btn.scrollIntoViewIfNeeded().catch(() => {});
      await btn.click();
      await expect(
        page.locator('#dashboard-panel-resolver'),
        `dashboard harus muncul setelah klik #fast-auth-${id}`,
      ).toBeVisible({ timeout: 20000 });
      // Kembali ke public tiap selesai
      await page.locator('#fast-auth-public').click();
      await expect(page.locator('#site-header'), 'header publik harus kembali setelah public').toBeVisible({
        timeout: 15000,
      });
      await expect(page.locator('#dashboard-panel-resolver')).toBeHidden();
    }

    // public eksplisit
    await page.locator('#fast-auth-public').click();
    await expect(page.locator('#site-header')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#core-viewport')).toBeVisible({ timeout: 15000 });
    expectClean(get());
  });
});

test.describe('QA Sweep 1b: Menu desktop — tab internal', () => {
  test('Beranda (tab langsung)', async ({ page }) => {
    const get = await collectErrors(page);
    await gotoHome(page);
    await page.locator(`${DESKTOP_NAV} > div > button`, { hasText: 'Beranda' }).first().click();
    await expectTabRendered(page, 'beranda');
    expectClean(get());
  });

  test('Tentang Kami → 5 child langsung (SK-CDC, Kalender, Laporan, MOU, Galeri)', async ({ page }) => {
    const get = await collectErrors(page);
    await gotoHome(page);
    const children = [
      'Surat Keputusan CDC',
      'Kalender Kegiatan',
      'Laporan Kinerja',
      'MOU Dengan Stakeholder',
      'Galeri',
    ];
    for (const child of children) {
      await openParent(page, 'Tentang Kami');
      await (await childItem(page, child)).click();
      await expectTabRendered(page, child);
    }
    expectClean(get());
  });

  test('Tentang Kami → Profil → Visi-Misi & Keanggotaan (side sub-menu)', async ({ page }) => {
    const get = await collectErrors(page);
    await gotoHome(page);
    for (const leaf of ['Visi', 'Keanggotaan']) {
      await openParent(page, 'Tentang Kami');
      // FIX BUG-005: activeSubMenu default = 'Profil' → panel kanan SUDAH
      // terbuka saat dropdown dibuka, leaf langsung diklik. Klik "Profil"
      // sekarang NAVIGASI (bukan expand) → jangan klik intermediate lagi.
      const leafBtn = page.locator(`${DESKTOP_NAV} div.min-w-\\[200px\\] [role="menuitem"]`, { hasText: leaf }).first();
      await expect(leafBtn, `sub-child "${leaf}" harus muncul di side sub-menu`).toBeVisible({ timeout: 8000 });
      await leafBtn.click();
      await expectTabRendered(page, leaf);
    }
    expectClean(get());
  });

  test('Layanan → 8 tab internal', async ({ page }) => {
    const get = await collectErrors(page);
    await gotoHome(page);
    const children = [
      'Berita & Artikel',
      'Konseling Karir',
      'Workshop Pengembangan Karir',
      'Pelatihan Softskill',
      'Seminar Sukses Berkarir',
      'Job Fair',
      'Campus Hiring',
      'Internship',
    ];
    for (const child of children) {
      await openParent(page, 'Layanan');
      await (await childItem(page, child)).click();
      await expectTabRendered(page, child);
    }
    expectClean(get());
  });

  test('Prestasi → 6 tab (Internasional/Nasional/Wilayah × Akademik/Non-Akademik)', async ({ page }) => {
    const get = await collectErrors(page);
    await gotoHome(page);
    const groups = ['Internasional', 'Nasional', 'Wilayah'];
    const leaves = ['Akademik', 'Non-Akademik'];
    for (const g of groups) {
      for (const leaf of leaves) {
        await openParent(page, 'Prestasi');
        await (await childItem(page, g)).click();
        const leafBtn = page.locator(`${DESKTOP_NAV} [role="menu"] [role="menuitem"]`, { hasText: leaf }).last();
        await expect(leafBtn, `"${g} → ${leaf}" harus muncul di side sub-menu`).toBeVisible({ timeout: 5000 });
        await leafBtn.click();
        await expectTabRendered(page, `${g}/${leaf}`);
      }
    }
    expectClean(get());
  });

  test('Register → alumni & perusahaan; Job Info → Lowongan Terbaru', async ({ page }) => {
    const get = await collectErrors(page);
    await gotoHome(page);

    // Label dropdown DITERJEMAHKAN via getNavText (i18n.ts:44-45), bukan
    // label mentah NAV_ITEMS — terbukti di probe: 'Register User' tidak ada di DOM.
    await openParent(page, 'Register');
    await (await childItem(page, 'Register Mahasiswa / Alumni')).click();
    await expect(page.locator('#core-viewport')).toBeVisible({ timeout: 10000 });
    expect(((await page.locator('#core-viewport').innerText().catch(() => '')) || '').length).toBeGreaterThan(20);

    await gotoHome(page);
    await openParent(page, 'Register');
    await (await childItem(page, 'Register Mitra')).click();
    await expect(page.locator('#core-viewport')).toBeVisible({ timeout: 10000 });
    expect(((await page.locator('#core-viewport').innerText().catch(() => '')) || '').length).toBeGreaterThan(20);

    await gotoHome(page);
    await openParent(page, 'Job Info');
    await (await childItem(page, 'Lowongan Terbaru')).click();
    await expectTabRendered(page, 'lowongan');
    expectClean(get());
  });

  test('Login bisa dicapai publik via halaman Register ("Login Sekarang")', async ({ page }) => {
    const get = await collectErrors(page);
    await gotoHome(page);
    // FAKTA (probe DOM + baca code 15 Sep 2026): tidak ada tombol/link Login
    // di header maupun homepage publik. Register render langsung form
    // (isEnteringForm=true); di header form ada tombol "Login" tanpa id
    // (Register.tsx:491-496) yang memanggil onNavigateToLogin.
    await openParent(page, 'Register');
    await (await childItem(page, 'Register Mahasiswa / Alumni')).click();
    await expect(page.locator('#core-viewport')).toBeVisible({ timeout: 10000 });
    const goLogin = page.locator('#core-viewport button', { hasText: /^Login$/ }).first();
    await expect(goLogin, 'tombol "Login" harus ada di header form register').toBeVisible({ timeout: 10000 });
    await goLogin.click();
    await expect(page.locator('#login-page-root'), 'form login harus muncul').toBeVisible({ timeout: 10000 });
    expectClean(get());
  });
});

test.describe('QA Sweep 1c: Menu desktop — link eksternal (tanpa navigasi keluar)', () => {
  test('9 link eksternal NAV_ITEMS membuka window.open dengan URL valid', async ({ page }) => {
    const get = await collectErrors(page);
    await gotoHome(page);
    await stubWindowOpen(page);

    const cases: Array<{ parent: string; child: string; url: string }> = [
      { parent: 'Layanan', child: 'Tes Potensi Minat Kerja', url: 'https://www.klob.id/klob-journey/klob-meter' },
      { parent: 'Tracer Study', child: 'Tracer Study', url: 'https://tracerstudy.umkendari.ac.id/' },
      {
        parent: 'Tracer Study',
        child: 'Form Kuesioner Tracer Study',
        url: 'https://tracerstudy.umkendari.ac.id/page/survey',
      },
      { parent: 'Simbelmawa', child: 'PKM', url: 'https://simbelmawa.kemdiktisaintek.go.id/pkm' },
      { parent: 'Simbelmawa', child: 'PPK ORMAWA', url: 'https://ppkormawa.kemdiktisaintek.go.id/' },
      { parent: 'Simbelmawa', child: 'P2MW', url: 'https://p2mw.kemdiktisaintek.go.id/' },
      { parent: 'Simbelmawa', child: 'KMI EXPO', url: 'https://simbelmawa.kemdiktisaintek.go.id/' },
      { parent: 'Simbelmawa', child: 'PILMAPRES', url: 'https://pilmapres.kemdiktisaintek.go.id/' },
      { parent: 'Job Info', child: 'APSKAR PTMA', url: 'https://apskarptma.or.id/' },
    ];

    for (const c of cases) {
      await openParent(page, c.parent);
      // Child eksternal adalah <button> (window.open), BUKAN <a href> —
      // jadi verifikasi via URL yang dilewatkan ke window.open.
      const btn = page.locator(`${DESKTOP_NAV} [role="menu"] [role="menuitem"]`, { hasText: c.child }).first();
      await expect(btn, `tombol eksternal "${c.child}" harus ada`).toBeVisible({ timeout: 5000 });
      await btn.click();
      const opened = await lastOpenedUrl(page);
      expect(opened, `"${c.child}" harus memanggil window.open`).toBeTruthy();
      assertValidUrl(opened as string, c.child);
      expect((opened as string).replace(/\/$/, ''), `"${c.child}" URL tidak sesuai`).toBe(c.url.replace(/\/$/, ''));
      // Halaman TIDAK boleh navigasi keluar
      expect(page.url()).toContain('localhost:3000');
      await page.keyboard.press('Escape').catch(() => {});
    }
    expectClean(get());
  });

  test('TOP_LINKS: 4 href valid; MTQMN dihapus (fix BUG-002)', async ({ page }) => {
    const get = await collectErrors(page);
    await gotoHome(page);

    const validLinks: Array<{ label: string; host: string }> = [
      { label: 'ICCN', host: 'indonesiacareercenter.id' },
      { label: 'Website UM Kendari', host: 'umkendari.ac.id' },
      { label: 'SIMBELMAWA', host: 'simbelmawa.kemdiktisaintek.go.id' },
      { label: 'SIMKATMAWA', host: 'simkatmawa.kemdikbud.go.id' },
    ];
    for (const l of validLinks) {
      const a = page.locator('#site-header a', { hasText: l.label }).first();
      await expect(a, `top link "${l.label}" harus ada`).toBeVisible();
      const href = await a.getAttribute('href');
      assertValidUrl(href ?? '', l.label);
      expect((href as string).includes(l.host), `"${l.label}" host harus ${l.host}`).toBe(true);
      expect(await a.getAttribute('target'), `"${l.label}" harus target=_blank`).toBe('_blank');
    }

    // MTQMN dihapus dari TOP_LINKS (fix BUG-002, 15 Sep 2026): pastikan
    // tidak ada lagi link ber-href kosong di top bar.
    const mtqm = page.locator('#site-header a', { hasText: 'MTQMN' });
    await expect(mtqm, 'link MTQMN harus sudah dihapus').toHaveCount(0);
    const emptyHref = page.locator('#site-header a[href=""]');
    await expect(emptyHref, 'tidak boleh ada link href kosong di header').toHaveCount(0);
    expectClean(get());
  });
});

test.describe('QA Sweep 1d: Toggle bahasa ID/EN', () => {
  test('ID → EN → ID: label nav berubah', async ({ page }) => {
    const get = await collectErrors(page);
    await gotoHome(page);

    const toggle = page.locator(LANG_TOGGLE);
    await expect(toggle, 'toggle bahasa harus ada').toBeVisible({ timeout: 10000 });
    await expect(toggle).toContainText('ID');
    await expect(page.locator(DESKTOP_NAV).first()).toContainText('Beranda');

    await toggle.click();
    // Opsi ada di popup div.absolute (terbukti di probe4) — JANGAN pakai
    // getByRole global: nama "EN" ambigu dan bikin timeout 30s.
    const enOpt = page.locator('div.absolute button').filter({ hasText: /^EN$/ }).first();
    await expect(enOpt, 'opsi EN harus ada di popup bahasa').toBeVisible({ timeout: 5000 });
    await enOpt.click();
    await expect(toggle).toContainText('EN', { timeout: 5000 });
    await expect(page.locator(DESKTOP_NAV).first()).toContainText('Home', { timeout: 5000 });
    await expect(page.locator(DESKTOP_NAV).first()).toContainText('About Us', { timeout: 5000 });

    await toggle.click();
    const idOpt = page.locator('div.absolute button').filter({ hasText: /^ID$/ }).first();
    await expect(idOpt, 'opsi ID harus ada di popup bahasa').toBeVisible({ timeout: 5000 });
    await idOpt.click();
    await expect(toggle).toContainText('ID', { timeout: 5000 });
    await expect(page.locator(DESKTOP_NAV).first()).toContainText('Beranda', { timeout: 5000 });
    expectClean(get());
  });
});

test.describe('QA Sweep 1e: Menu mobile (viewport 375px)', () => {
  test('hamburger buka/tutup, parent expand, klik child, tanpa overflow horizontal', async ({ page }) => {
    const get = await collectErrors(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await gotoHome(page);

    const openBtn = page.getByRole('button', { name: 'Buka menu' });
    await expect(openBtn, 'hamburger "Buka menu" harus ada di 375px').toBeVisible({ timeout: 10000 });

    // Buka drawer
    await openBtn.click();
    const drawer = page.locator(MOBILE_DRAWER);
    await expect(drawer, 'drawer mobile harus terbuka').toBeVisible({ timeout: 5000 });

    // Tutup via toggle
    await page.getByRole('button', { name: 'Tutup menu' }).click();
    await expect(drawer, 'drawer mobile harus tertutup').toBeHidden({ timeout: 5000 });

    // Buka lagi → expand 1 parent (Layanan) → klik 1 child (Berita & Artikel)
    await page.getByRole('button', { name: 'Buka menu' }).click();
    await expect(drawer).toBeVisible({ timeout: 5000 });
    await drawer.getByRole('button', { name: /Layanan/ }).first().click();
    const childBtn = drawer.getByRole('button', { name: /Berita/ }).first();
    await expect(childBtn, 'child "Berita & Artikel" harus muncul setelah expand').toBeVisible({ timeout: 5000 });
    await childBtn.click();
    await expectTabRendered(page, 'berita-mobile');

    // Tidak ada overflow horizontal (scrollWidth <= 390)
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollW, `overflow horizontal terdeteksi (scrollWidth=${scrollW})`).toBeLessThanOrEqual(390);
    expectClean(get());
  });
});
