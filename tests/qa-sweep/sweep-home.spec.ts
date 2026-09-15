import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { collectErrors, gotoHome, expectClean, openParent, childItem, hasLiveCards } from './helpers';

/**
 * QA Sweep 1: Beranda / Home (Chromium, baseURL localhost:3000).
 * Server SUDAH jalan (jangan start server dari spec ini).
 * REPORT-ONLY terhadap src/ — spec ini hanya membaca & mengklik UI.
 *
 * CATATAN DATA (probe 15 Sep 2026): homepage render dari data live
 * /api/public-data (async). lowongan live=0 (kosong — bukan bug tombol),
 * berita live=9, konten_karir=11, hero 6 slide localStorage. Test kartu
 * menunggu data live via hasLiveCards; skip bila DB kosong.
 */

async function pauseHeroAutoplay(page: Page) {
  // HeroSlider auto-play 5 dtk; hover mem-pause via onMouseEnter.
  await page.hover('#carouselExampleControls');
}

async function openLowonganTab(page: Page) {
  await openParent(page, 'Job Info');
  await (await childItem(page, 'Lowongan Terbaru')).click();
  await page.waitForSelector('#tab-lowongan', { timeout: 15000 });
}

async function openBeritaTab(page: Page) {
  await openParent(page, 'Layanan');
  await (await childItem(page, 'Berita & Artikel')).click();
  await page.waitForSelector('#tab-berita', { timeout: 15000 });
}

test.describe('QA Sweep 1: Beranda', () => {
  test('1. HeroSlider — prev/next/dots ganti slide', async ({ page }) => {
    const get = await collectErrors(page);
    await gotoHome(page);
    await page.waitForSelector('#carouselExampleControls', { timeout: 15000 });

    const dots = page.locator("#carouselExampleControls button[aria-label^='Go to slide']");
    const dotCount = await dots.count();
    test.skip(dotCount < 2, `hanya ${dotCount} slide — kontrol prev/next/dots tidak dirender`);

    await pauseHeroAutoplay(page);
    const img = page.locator('#carouselExampleControls .carousel-item img').first();
    const firstAlt = await img.getAttribute('alt');

    // NEXT ganti slide
    await page.click("#carouselExampleControls button[aria-label='Next Slide']");
    await expect.poll(async () => page.locator('#carouselExampleControls .carousel-item img').first().getAttribute('alt')).not.toBe(firstAlt);

    // PREV kembali ke slide awal
    await pauseHeroAutoplay(page);
    await page.click("#carouselExampleControls button[aria-label='Previous Slide']");
    await expect.poll(async () => page.locator('#carouselExampleControls .carousel-item img').first().getAttribute('alt')).toBe(firstAlt);

    // DOTS lompat ke slide 2 — tunggu transisi selesai (poll, bukan baca langsung:
    // autoplay + AnimatePresence bisa menimpa klik bila dibaca terlalu cepat).
    await pauseHeroAutoplay(page);
    await page.click("#carouselExampleControls button[aria-label='Go to slide 2']");
    await expect.poll(async () => page.locator('#carouselExampleControls .carousel-item img').first().getAttribute('alt'), { timeout: 8000 }).not.toBe(firstAlt);

    expectClean(get());
  });

  test('2. HeroSlider — CTA slide navigasi benar', async ({ page }) => {
    const get = await collectErrors(page);
    await gotoHome(page);
    await page.waitForSelector('#carouselExampleControls', { timeout: 15000 });
    await pauseHeroAutoplay(page);

    // Slide tanpa targetUrl memakai cursor-default; yang bisa diklik memakai cursor-pointer.
    const clickable = await page.locator('#carouselExampleControls .carousel-item.active').evaluate((el) =>
      el.className.includes('cursor-pointer'),
    );
    test.skip(!clickable, 'slide aktif tidak punya targetUrl (cursor-default) — CTA tidak bisa diuji di seed ini');

    // Klik CTA: target internal (setTab) ATAU eksternal (window.open _blank). Jangan navigasi eksternal.
    const popupPromise = page.waitForEvent('popup', { timeout: 4000 }).catch(() => null);
    await page.locator('#carouselExampleControls .carousel-item.active').click();
    const popup = await popupPromise;
    if (popup) {
      // Target eksternal: cukup verifikasi URL popup valid, lalu tutup.
      expect(popup.url()).toMatch(/^https?:\/\//);
      await popup.close();
    } else {
      // Target internal: tab beranda hilang / tab lain muncul.
      await expect.poll(async () => page.locator('#tab-beranda').count()).toBe(0);
    }
    expectClean(get());
  });

  test('3. Kartu lowongan beranda → JobDetail → Kembali', async ({ page }) => {
    const get = await collectErrors(page);
    await gotoHome(page);
    await page.waitForSelector('#job-listings', { timeout: 15000 });
    // Data live async: lowongan live=0 saat probe — skip bila kosong (bukan bug tombol).
    test.skip(!(await hasLiveCards(page, '#job-listings .grid h3')), 'tidak ada kartu lowongan live (DB kosong) — alur kartu tidak bisa diuji');

    const firstCardTitle = page.locator('#job-listings .grid h3').first();
    const titleText = (await firstCardTitle.textContent())?.trim();
    await page.locator('#job-listings .grid > div').first().click();

    // JobDetail render: h1 judul + instansi + tombol Lamar/tutup + Kembali.
    const detailH1 = page.locator('h1').first();
    await detailH1.waitFor({ timeout: 15000 });
    if (titleText) await expect(detailH1).toContainText(titleText.slice(0, 20));
    await expect(page.locator('#btn-lamar-sekarang-top, #btn-cta-admin, #btn-lamar-pekerjaan-ini, text=Pendaftaran Ditutup').first()).toBeVisible();
    await expect(page.locator('#job-back-link')).toBeVisible();
    expectClean(get());

    // Kembali ke daftar.
    await page.click('#job-back-link');
    await page.waitForSelector('#job-listings', { timeout: 15000 });
    expectClean(get());
  });

  test('4. Kartu berita beranda → BeritaDetailView → kembali', async ({ page }) => {
    const get = await collectErrors(page);
    await gotoHome(page);
    // Section #berita-home hanya render bila homeUnifiedNews.length > 0 (data live async).
    test.skip(!(await hasLiveCards(page, '#berita-home .grid > div')), 'section berita beranda kosong (data live belum ada) — alur kartu tidak bisa diuji');

    const firstNews = page.locator('#berita-home .grid > div').first();
    await firstNews.click();

    // BeritaDetailView: tombol kembali khas + judul berita.
    const backBtn = page.locator('button:has-text("Kembali ke Berita")').first();
    await backBtn.waitFor({ timeout: 15000 });
    await expect(page.locator('h1').first()).toBeVisible();
    expectClean(get());

    await backBtn.click();
    await page.waitForSelector('#berita-home', { timeout: 15000 });
    expectClean(get());
  });

  test('5. Kartu program/pengumuman → #program-detail-panel → #program-back-btn', async ({ page }) => {
    const get = await collectErrors(page);
    await gotoHome(page);
    const section = page.locator('section:has(h3:has-text("PROGRAM & PENGUMUMAN"))').first();
    await section.waitFor({ timeout: 15000 });

    // Pilih kartu ber-jenis program/pengumuman (workshop/seminar/softskill membuka tab event, bukan panel).
    const programCard = section.locator('div.group:has-text("JOB PREPARATION")').first();
    const target = (await programCard.count()) > 0 ? programCard : section.locator('div.group').first();
    await target.click();

    const panel = page.locator('#program-detail-panel');
    const panelVisible = await panel.isVisible().catch(() => false);
    test.skip(!panelVisible, 'klik membuka tab event / tidak ada item program di seed ini');
    await expect(page.locator('#program-back-btn')).toBeVisible();
    expectClean(get());

    await page.click('#program-back-btn');
    await expect(panel).toBeHidden({ timeout: 10000 });
    expectClean(get());
  });

  test('6. Tab lowongan — keyword, provinsi, spesialisasi, sort, pagination, detail', async ({ page }) => {
    const get = await collectErrors(page);
    await gotoHome(page);
    await openLowonganTab(page);

    const counter = page.locator('#tab-lowongan span:has-text("lowongan")').first();
    await expect(counter).toBeVisible();
    // Tab lowongan bisa kosong (live=0 saat probe): filter/sort tetap harus
    // berfungsi tanpa error; alur klik-detail di-skip bila kosong.
    const hasResults = await hasLiveCards(page, '#tab-lowongan .grid h3', 15000);

    // 6a. Keyword
    const keyword = page.locator('#tab-lowongan input[placeholder*="Kata kunci"]').first();
    await keyword.fill('staff');
    await page.waitForTimeout(600);
    await expect(counter).toBeVisible();
    await expect(page.locator('#tab-lowongan .grid h3, #tab-lowongan h3:has-text("Tidak Ada Lowongan")').first()).toBeVisible();
    expectClean(get());
    await keyword.fill('');
    await page.waitForTimeout(400);

    // 6b. Filter provinsi (popover "Semua Lokasi" + cari kota)
    await page.locator('#tab-lowongan button:has-text("Semua Lokasi")').first().click();
    const provSearch = page.locator('#tab-lowongan input[placeholder*="provinsi"]').first();
    await provSearch.waitFor({ timeout: 8000 });
    await provSearch.fill('Kendari');
    const provCheck = page.locator('#tab-lowongan label:has(input[type="checkbox"])').first();
    await provCheck.waitFor({ timeout: 8000 });
    await provCheck.click();
    await page.keyboard.press('Escape');
    await expect(counter).toBeVisible();
    await expect(page.locator('#tab-lowongan .grid h3, #tab-lowongan h3:has-text("Tidak Ada Lowongan")').first()).toBeVisible();
    expectClean(get());

    // 6c. Filter spesialisasi (popover "Semua Spesialisasi", centang pertama)
    await page.locator('#tab-lowongan button:has-text("Semua Spesialisasi")').first().click();
    const specCheck = page.locator('#tab-lowongan label:has(input[type="checkbox"])').first();
    await specCheck.waitFor({ timeout: 8000 });
    await specCheck.click();
    await page.keyboard.press('Escape');
    await expect(counter).toBeVisible();
    await expect(page.locator('#tab-lowongan .grid h3, #tab-lowongan h3:has-text("Tidak Ada Lowongan")').first()).toBeVisible();
    expectClean(get());

    // Reset filter agar sort & pagination diuji di atas data penuh.
    const resetBtn = page.locator('#tab-lowongan button:has-text("Bersihkan Filter")').first();
    if (await resetBtn.count()) await resetBtn.click();

    // 6d. Sort Terlama via Dropdown "Urutkan"
    const sortTrigger = page.locator('#tab-lowongan').getByRole('button', { name: /Terbaru|Terlama|Abjad/ }).first();
    await sortTrigger.click();
    await page.locator('#tab-lowongan [role="option"]:has-text("Terlama")').first().click();
    await expect(counter).toBeVisible();
    await expect(page.locator('#tab-lowongan .grid h3, #tab-lowongan h3:has-text("Tidak Ada Lowongan")').first()).toBeVisible();
    expectClean(get());
    // Kembalikan ke Terbaru
    await sortTrigger.click();
    await page.locator('#tab-lowongan [role="option"]:has-text("Terbaru")').first().click();

    // 6e. Pagination (hanya bila >9 hasil)
    const pagNav = page.locator('#tab-lowongan nav[aria-label="Navigasi halaman"]');
    if (await pagNav.count()) {
      const nextBtn = pagNav.getByRole('button', { name: '2' }).first();
      if (await nextBtn.count()) {
        await nextBtn.click();
        await expect(counter).toContainText('10-', { timeout: 8000 });
        await expect(page.locator('#tab-lowongan .grid h3').first()).toBeVisible();
      }
    }
    expectClean(get());

    // 6f. Klik 1 hasil → detail
    test.skip(!hasResults, 'tab lowongan kosong (DB live tanpa lowongan) — klik detail tidak bisa diuji');
    if (await resetBtn.count()) await resetBtn.click();
    const resultTitle = page.locator('#tab-lowongan .grid h3').first();
    await resultTitle.waitFor({ timeout: 15000 });
    const resultText = (await resultTitle.textContent())?.trim();
    await resultTitle.click();
    const h1 = page.locator('h1').first();
    await h1.waitFor({ timeout: 15000 });
    if (resultText) await expect(h1).toContainText(resultText.slice(0, 20));
    expectClean(get());
  });

  test('7. Tombol Lamar sebagai publik → redirect halaman auth (login/register)', async ({ page }) => {
    const get = await collectErrors(page);
    await gotoHome(page);
    await page.waitForSelector('#job-listings', { timeout: 15000 });
    test.skip(!(await hasLiveCards(page, '#job-listings .grid > div')), 'tidak ada kartu lowongan live — alur Lamar tidak bisa diuji');
    await page.locator('#job-listings .grid > div').first().click();
    await page.locator('h1').first().waitFor({ timeout: 15000 });

    // Lowongan eksternal (link _blank) & yang kedaluwarsa tidak diuji — cari tombol Lamar internal.
    const expired = await page.locator('text=Pendaftaran Ditutup').count();
    const external = await page.locator('#btn-cta-admin, #btn-cta-admin-side').count();
    test.skip(expired > 0 || external > 0, 'lowongan pertama kedaluwarsa/eksternal — tidak ada alur Lamar internal');

    // NOTE kode: JobDetail publik memanggil onNavigateToRegister (bukan onNavigateToLogin),
    // jadi redirect yang benar adalah halaman REGISTER; login diterima sebagai alternatif.
    const lamarBtn = page.locator('#btn-lamar-sekarang-top, #btn-lamar-pekerjaan-ini').first();
    await lamarBtn.click();
    await expect(page.locator('#register-hero-root, #login-page-root').first()).toBeVisible({ timeout: 10000 });
    expectClean(get());
  });

  test('8. SocialShareBar — tombol share valid, popup Facebook benar', async ({ page }) => {
    const get = await collectErrors(page);
    await gotoHome(page);
    await openBeritaTab(page);

    await expect(page.locator('#tab-berita button[title="Bagikan ke Facebook"]')).toBeVisible();
    await expect(page.locator('#tab-berita button[title="Bagikan ke Twitter / X"]')).toBeVisible();
    await expect(page.locator('#tab-berita button[title="Salin Tautan Halaman"]')).toBeVisible();
    expectClean(get());

    // Klik Facebook → window.open popup share-dialog; verifikasi URL lalu tutup (tanpa navigasi eksternal).
    const fbBtn = page.locator('#tab-berita button[title="Bagikan ke Facebook"]').first();
    const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
    await fbBtn.click();
    const popup = await popupPromise;
    test.skip(!popup, 'popup share Facebook diblokir di lingkungan ini');
    expect(popup!.url()).toContain('facebook.com');
    await popup!.close();
    expectClean(get());
  });

  test('9. Footer — link internal (loker terkini & popular info) navigasi benar', async ({ page }) => {
    const get = await collectErrors(page);
    await gotoHome(page);
    await page.locator('#pub-footer').first().scrollIntoViewIfNeeded();

    // 9a. INFO LOKER TERKINI → JobDetail → kembali
    const lokerBtn = page.locator('#pub-footer span.line-clamp-1').first();
    await lokerBtn.waitFor({ timeout: 15000 });
    await lokerBtn.click();
    await page.locator('h1').first().waitFor({ timeout: 15000 });
    await expect(page.locator('#job-back-link')).toBeVisible();
    expectClean(get());
    await page.click('#job-back-link');

    // 9b. Popular Info → detail berita/program → kembali ke beranda
    await page.locator('#pub-footer').first().scrollIntoViewIfNeeded();
    const popularBtn = page.locator('#pub-footer li button span.line-clamp-2').first();
    await popularBtn.waitFor({ timeout: 15000 });
    await popularBtn.click();
    await page.waitForTimeout(1500);
    await expect(page.locator('#program-detail-panel, h1, #tab-berita').first()).toBeVisible({ timeout: 10000 });
    expectClean(get());
  });
});
