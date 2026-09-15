import { test, expect } from '@playwright/test';
import { collectErrors, gotoHome, expectClean, openParent, childItem } from './helpers';

/**
 * QA Sweep 4: Lamar lowongan dummy [QA-TEST] sebagai mahasiswa (login REAL 1x).
 * Dummy = lowongan PUBLISHED terbaru (createdAt paling baru, sort Terbaru) ->
 * kartu pertama di grid = dummy. Klik h3 pertama -> JobDetail inline ->
 * "Lamar Pekerjaan" -> modal -> isi + upload CV -> Kirim -> sukses ->
 * verifikasi di Lamaran Saya. Cleanup DB terpisah.
 */
const MHS_EMAIL = 'qa_mhs_23568@umkendari.ac.id';
const MHS_PASS = 'QaTest2026X';
const DUMMY_MARK = '[QA-TEST]';

test('4. Lamar dummy end-to-end (login real -> kirim -> terdaftar)', async ({ page }) => {
  const get = await collectErrors(page);
  await gotoHome(page);

  // Login real via jalur terbukti
  await openParent(page, 'Register');
  await (await childItem(page, 'Register Mahasiswa / Alumni')).click();
  await expect(page.locator('#register-page-root, #register-hero-root')).toBeVisible({ timeout: 15000 });
  await page.locator('#core-viewport button', { hasText: /^Login$/ }).first().click();
  await expect(page.locator('#login-page-root')).toBeVisible({ timeout: 10000 });
  await page.locator('#login-mahasiswa-btn').click();
  await page.locator('#login-input-email').fill(MHS_EMAIL);
  await page.locator('#login-input-password').fill(MHS_PASS);
  await page.locator('#login-submit-button').click();
  await expect(page.locator('#mahasiswa-dashboard')).toBeVisible({ timeout: 20000 });
  console.log('QA-LAMARAN login OK');
  expectClean(get());
  await page.waitForTimeout(3000);

  // Kartu pertama = dummy terbaru. Verifikasi judul sebelum klik.
  const firstH3 = page.locator('#mahasiswa-dashboard h3').first();
  await expect(firstH3).toBeVisible({ timeout: 15000 });
  const firstTitle = (await firstH3.textContent())?.trim() ?? '';
  console.log('QA-LAMARAN first card:', JSON.stringify(firstTitle.slice(0, 80)));
  expect(firstTitle, 'kartu terbaru harus dummy [QA-TEST]').toContain(DUMMY_MARK);
  await firstH3.click();
  await page.waitForTimeout(1500);

  // JobDetail inline -> Lamar Pekerjaan
  const lamar = page.locator('#mahasiswa-dashboard button', { hasText: /Lamar Pekerjaan/ }).first();
  await expect(lamar, 'tombol Lamar Pekerjaan ada di JobDetail').toBeVisible({ timeout: 10000 });
  await lamar.click();
  await page.waitForTimeout(1200);

  // Modal: isi field + upload CV
  const modal = page.locator('div.fixed').last();
  const boxes = modal.locator('input[type="text"], input:not([type]), input[type="email"]');
  const n = await boxes.count();
  console.log(`QA-LAMARAN form inputs: ${n}`);
  const vals = ['QA Tester Dummy', 'qa_mhs_23568@umkendari.ac.id', 'Teknik Informatika', 'QA23568'];
  for (let i = 0; i < Math.min(n, 4); i++) {
    await boxes.nth(i).fill(vals[i] ?? `QA Dummy ${i + 1}`).catch(() => {});
  }
  const fileInput = modal.locator('input[type="file"]').first();
  if (await fileInput.count()) {
    await fileInput.setInputFiles('/tmp/qa/cv-dummy.pdf');
    await page.waitForTimeout(1000);
    console.log('QA-LAMARAN CV uploaded');
  }

  // Kirim
  const kirim = modal.getByRole('button', { name: /Kirim Lamaran|Kirim/i }).first();
  await expect(kirim, 'tombol Kirim ada').toBeVisible({ timeout: 8000 });
  await kirim.click();
  await page.waitForTimeout(3000);
  const bodyText = await page.evaluate(() => document.body.textContent ?? '');
  console.log('QA-LAMARAN after-submit:', JSON.stringify(bodyText.slice(-300)));
  expect(bodyText).toMatch(/Berhasil|berhasil|Terkirim|terkirim|Sukses/i);
  expectClean(get());

  // Verifikasi di Lamaran Saya
  await page.locator('#mahasiswa-dashboard nav.hidden').getByRole('button', { name: 'Lamaran Saya' }).click();
  await page.waitForTimeout(1500);
  await expect(page.locator('#mahasiswa-dashboard', { hasText: DUMMY_MARK }).first()).toBeVisible({ timeout: 10000 });
  console.log('QA-LAMARAN terdaftar di Lamaran Saya');
  expectClean(get());
});
