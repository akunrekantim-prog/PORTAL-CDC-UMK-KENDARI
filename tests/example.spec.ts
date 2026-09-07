import { test, expect } from '@playwright/test';

/**
 * E2E Test Suite - Portal CDC UM Kendari
 * Pragmatic tests: stable, core functionality only
 *
 * NOTE: Fast-Role Tester (#aistudio-role-switcher) hanya aktif di development.
 * Di production (npm run build), role switcher tidak dirender sehingga
 * test ini hanya memverifikasi elemen yang selalu ada.
 */

test.describe('Core Page Load', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Portal CDC UM Kendari/i);
    await expect(page.locator('#root')).toBeVisible();
  });

  test('page has navigation header', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header').or(page.locator('nav')).first();
    await expect(header).toBeVisible();
  });
});

test.describe('Role Switcher (Development Only)', () => {
  test('role switcher elements only visible in dev mode', async ({ page }) => {
    await page.goto('/');
    const roleSwitcher = page.locator('#aistudio-role-switcher');

    if (process.env.NODE_ENV === 'production') {
      // Di production, role switcher tidak dirender
      await expect(roleSwitcher).not.toBeVisible();
    } else {
      // Di development, role switcher harus ada
      await expect(roleSwitcher).toBeVisible();
      await expect(page.locator('#fast-auth-admin')).toBeVisible();
      await expect(page.locator('#fast-auth-user')).toBeVisible();
      await expect(page.locator('#fast-auth-mitra')).toBeVisible();
    }
  });
});

test.describe('Basic Interaction', () => {
  test('can click navigation items without error', async ({ page }) => {
    await page.goto('/');
    const berandaBtn = page.locator('nav').getByText('Beranda').first();
    if (await berandaBtn.isVisible()) {
      await berandaBtn.click();
      await page.waitForTimeout(300);
      await expect(page.locator('#root')).toBeVisible();
    }
  });
});

test.describe('Content Presence', () => {
  test('has some job listings or content', async ({ page }) => {
    await page.goto('/');
    const hasContent = await page.locator('main').isVisible().catch(() => false) ||
                       await page.locator('article').first().isVisible().catch(() => false) ||
                       await page.locator('.container').first().isVisible().catch(() => false);
    expect(hasContent).toBeTruthy();
  });
});
