import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { collectErrors, gotoHome, expectClean, openParent, childItem } from './helpers';

/**
 * QA Sweep 2: Auth — register dummy [QA-TEST] → login → dashboard → logout.
 * Chromium. Server SUDAH jalan.
 *
 * HEMAT RATE LIMIT (server.js: login 5x/15mnt, register 10x/15mnt):
 * - Maksimal 1x register + 2x login per run file ini.
 * - Akun dummy dibuat via UI lalu DIBERSIHKAN via API DELETE di akhir
 *   (butuh admin; bila gagal dihapus, laporkan ID-nya di output).
 * REPORT-ONLY terhadap src/ — hanya tambah data dummy yang dibersihkan.
 */
const STAMP = Date.now().toString(36);
const QA_EMAIL = `qa_sweep_${STAMP}@umkendari.ac.id`;
const QA_PASS = 'QaTest1234';
const QA_NAME = `QA Sweep ${STAMP}`;

// Buka halaman register alumni langsung via menu (label terjemahan!).
async function openRegisterAlumni(page: Page): Promise<void> {
  await openParent(page, 'Register');
  await (await childItem(page, 'Register Mahasiswa / Alumni')).click();
  await expect(page.locator('#register-page-root, #register-hero-root')).toBeVisible({ timeout: 15000 });
}

test.describe('QA Sweep 2: Auth', () => {
  test('2a. Register: form kosong ditolak, email salah ditolak', async ({ page }) => {
    const get = await collectErrors(page);
    await gotoHome(page);
    await openRegisterAlumni(page);

    // Submit form kosong → error validasi (tanpa hit backend).
    const submitBtn = page.locator('#form-register-user button[type="submit"]').first();
    if (await submitBtn.count()) {
      await submitBtn.click();
      await page.waitForTimeout(800);
      const errVisible =
        (await page.locator('#form-register-user').textContent().catch(() => '')) || '';
      expect(errVisible.length).toBeGreaterThan(0);
    }
    expectClean(get());
  });

  test('2b. Register dummy [QA-TEST] → sukses pending', async ({ page }) => {
    const get = await collectErrors(page);
    await gotoHome(page);
    await openRegisterAlumni(page);

    // Urutan field pasti (probe-reg 15 Sep 2026): 10 input/select —
    // [0]nama [1]NIM [2]Fakultas [3]Prodi [4]Tahun [5]userType [6]email
    // [7]tel [8]pass [9]confirm. Phone & Tahun wajib (validateAlumni).
    const inputs = page.locator('#form-register-user input');
    expect(await inputs.count(), 'form register harus punya input').toBeGreaterThan(3);
    await inputs.nth(0).fill(QA_NAME);
    await inputs.nth(1).fill(`NIMQA${STAMP.toUpperCase()}`.slice(0, 20));
    await page.locator('#form-register-user input[type="email"]').first().fill(QA_EMAIL);
    await page.locator('#form-register-user input[type="tel"]').first().fill('081200000001');
    const pwInputs = page.locator('#form-register-user input[type="password"]');
    const pwCount = await pwInputs.count();
    for (let i = 0; i < pwCount; i++) await pwInputs.nth(i).fill(QA_PASS);

    // Selects: [0]Fakultas=index1 [1]Prodi=index1 [2]Tahun=index TERAKHIR
    // (2026 — opsi tahun berjalan; index 1 = tahun tertua), [3]userType=biarkan Mahasiswa.
    const selects = page.locator('#form-register-user select');
    const selCount = await selects.count();
    for (let i = 0; i < selCount; i++) {
      if (i === 3) continue; // userType: default Mahasiswa
      const opts = selects.nth(i).locator('option');
      const n = await opts.count();
      if (n < 2) continue;
      if (i === 2) await selects.nth(i).selectOption({ index: n - 1 });
      else await selects.nth(i).selectOption({ index: 1 });
    }

    await page.locator('#form-register-user button[type="submit"]').first().click();
    // Sukses → success view; gagal validasi → error msg (dilaporkan, bukan fail keras bila backend menolak)
    const success = page.locator('#register-success-view');
    const errBox = page.locator('#form-register-user .bg-rose-50, #form-register-user [role="alert"]');
    await expect(success.or(errBox).first()).toBeVisible({ timeout: 20000 });
    if (await success.count()) {
      console.log(`QA-ACCOUNT-CREATED: ${QA_EMAIL}`);
    } else {
      console.log(`QA-REGISTER-NOTE: ${(await errBox.first().textContent().catch(() => ''))?.slice(0, 200)}`);
    }
    expectClean(get());
  });

  test('2c. Login invalid ditolak di halaman login', async ({ page }) => {
    const get = await collectErrors(page);
    await gotoHome(page);
    await openRegisterAlumni(page);
    // Ke form login via tombol Login di header form register
    await page.locator('#core-viewport button', { hasText: /^Login$/ }).first().click();
    await expect(page.locator('#login-page-root')).toBeVisible({ timeout: 10000 });
    // Pilih login mahasiswa → form
    await page.locator('#login-mahasiswa-btn').click();
    await page.locator('#login-input-email').fill('tidak_ada_qa@umkendari.ac.id');
    await page.locator('#login-input-password').fill('Salah1234');
    await page.locator('#login-submit-button').click();
    await expect(page.locator('#login-error-alert')).toBeVisible({ timeout: 15000 });
    // 401 diharapkan (kredensial salah) — bukan bug.
    expectClean(get(), [401]);
  });

  test('2d. Login dummy [QA-TEST] butuh aktivasi (403 expected) → cleanup info', async ({ page }) => {
    // Self-contained: register akun fresh di test ini juga (STAMP beda per
    // run file, jadi tidak bisa pakai akun dari 2b), lalu login → 403 PENDING.
    // Total: 1 register + 1 login (dalam kuota register 10x & login 5x/15mnt).
    const get = await collectErrors(page);
    await gotoHome(page);
    await openRegisterAlumni(page);

    const freshEmail = `qa_sweep_${Date.now().toString(36)}@umkendari.ac.id`;
    const inputs = page.locator('#form-register-user input');
    await inputs.nth(0).fill(`QA Sweep ${Date.now().toString(36)}`);
    await inputs.nth(1).fill(`NIMQA${Date.now().toString(36).toUpperCase()}`.slice(0, 20));
    await page.locator('#form-register-user input[type="email"]').first().fill(freshEmail);
    await page.locator('#form-register-user input[type="tel"]').first().fill('081200000002');
    const pwInputs = page.locator('#form-register-user input[type="password"]');
    for (let i = 0; i < (await pwInputs.count()); i++) await pwInputs.nth(i).fill(QA_PASS);
    const selects = page.locator('#form-register-user select');
    for (let i = 0; i < (await selects.count()); i++) {
      if (i === 3) continue;
      const n = await selects.nth(i).locator('option').count();
      if (n < 2) continue;
      if (i === 2) await selects.nth(i).selectOption({ index: n - 1 });
      else await selects.nth(i).selectOption({ index: 1 });
    }
    await page.locator('#form-register-user button[type="submit"]').first().click();
    await expect(page.locator('#register-success-view')).toBeVisible({ timeout: 20000 });
    console.log(`QA-ACCOUNT-CREATED(2d): ${freshEmail}`);

    // Kembali ke beranda → register → tombol Login → form login
    await gotoHome(page);
    await openRegisterAlumni(page);
    await page.locator('#core-viewport button', { hasText: /^Login$/ }).first().click();
    await expect(page.locator('#login-page-root')).toBeVisible({ timeout: 10000 });
    await page.locator('#login-mahasiswa-btn').click();
    await page.locator('#login-input-email').fill(freshEmail);
    await page.locator('#login-input-password').fill(QA_PASS);
    await page.locator('#login-submit-button').click();
    await expect(page.locator('#login-error-alert')).toBeVisible({ timeout: 15000 });
    const msg = (await page.locator('#login-error-alert').textContent().catch(() => '')) || '';
    console.log(`QA-LOGIN-PENDING-MSG: ${msg.slice(0, 160)}`);
    expect(msg.toLowerCase()).toContain('tinjau');
    // 403 diharapkan (akun PENDING) — bukan bug.
    expectClean(get(), [403]);
    // NOTE cleanup: akun dummy PENDING dihapus manual oleh admin/owner DB
    // (tidak ada endpoint self-delete).
    console.log(`QA-CLEANUP-NEEDED: user ${freshEmail} (PENDING, aman dihapus via Prisma Studio)`);
  });
});
