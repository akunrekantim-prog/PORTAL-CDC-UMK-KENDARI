import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { collectErrors, gotoHome, expectClean, hasLiveCards } from './helpers';

/**
 * QA Sweep 3: Dashboard Mahasiswa (via #fast-auth-user, state lokal — tanpa rate limit).
 * REPORT-ONLY: JANGAN submit lamaran / simpan profil / submit tracer.
 * Modal & form: isi 1 field lalu CANCEL/Escape.
 */
test.describe('QA Sweep 3: Dashboard Mahasiswa', () => {
  async function loginAsMahasiswa(page: Page): Promise<void> {
    await gotoHome(page);
    await page.locator('#fast-auth-user').click();
    await expect(page.locator('#dashboard-panel-resolver')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#mahasiswa-dashboard')).toBeVisible({ timeout: 15000 });
  }

  test('3a. 3 tab render (Lowongan / Lamaran Saya / Profil Saya)', async ({ page }) => {
    const get = await collectErrors(page);
    await loginAsMahasiswa(page);
    const nav = page.locator('#mahasiswa-dashboard nav.hidden');
    await expect(nav.getByRole('button', { name: 'Lowongan' })).toBeVisible();
    await expect(nav.getByRole('button', { name: 'Lamaran Saya' })).toBeVisible();
    await expect(nav.getByRole('button', { name: 'Profil Saya' })).toBeVisible();
    expectClean(get());
  });

  test('3b. Tab Lowongan: daftar + klik detail → kembali', async ({ page }) => {
    const get = await collectErrors(page);
    await loginAsMahasiswa(page);
    const dash = '#mahasiswa-dashboard';
    test.skip(!(await hasLiveCards(page, `${dash} .grid > div, ${dash} [class*="card"]`, 20000)), 'DB tanpa lowongan (bukan bug tombol)');
    // Klik kartu pertama → JobDetail inline
    const card = page.locator(`${dash} .grid > div`).first();
    await card.click();
    await page.waitForTimeout(1200);
    expectClean(get());
  });

  test('3c. Tab Lamaran Saya + Profil Saya render', async ({ page }) => {
    const get = await collectErrors(page);
    await loginAsMahasiswa(page);
    const nav = page.locator('#mahasiswa-dashboard nav.hidden');
    await nav.getByRole('button', { name: 'Lamaran Saya' }).click();
    await page.waitForTimeout(1000);
    expectClean(get());
    await nav.getByRole('button', { name: 'Profil Saya' }).click();
    await page.waitForTimeout(1000);
    // Form profil tampil, JANGAN simpan
    expectClean(get());
  });

  test('3d. Logout → kembali publik', async ({ page }) => {
    const get = await collectErrors(page);
    await loginAsMahasiswa(page);
    await page.locator('#mahasiswa-dashboard button', { hasText: 'Keluar' }).first().click();
    await expect(page.locator('#tab-beranda')).toBeVisible({ timeout: 15000 });
    expectClean(get());
  });
});
