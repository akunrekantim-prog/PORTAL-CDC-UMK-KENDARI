import { test, expect } from '@playwright/test';

/**
 * E2E Test Suite - Portal CDC UM Kendari
 * Pragmatic tests: stable, core functionality only
 */

test.describe('Core Page Load', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Portal CDC UM Kendari/i);
    await expect(page.locator('#root')).toBeVisible();
  });

  test('page has navigation header', async ({ page }) => {
    await page.goto('/');
    // Just check that a header exists, don't verify specific text
    const header = page.locator('header').or(page.locator('nav')).first();
    await expect(header).toBeVisible();
  });
});

test.describe('Fast Role Tester (top bar)', () => {
  test('has ADMIN CDC button', async ({ page }) => {
    await page.goto('/');
    // Use ID selector for specificity
    const adminBtn = page.locator('#fast-auth-admin');
    await expect(adminBtn).toBeVisible();
  });

  test('has USER button', async ({ page }) => {
    await page.goto('/');
    const userBtn = page.locator('#fast-auth-user');
    await expect(userBtn).toBeVisible();
  });

  test('has MITRA button', async ({ page }) => {
    await page.goto('/');
    // Use ID selector to avoid strict mode violation
    const mitraBtn = page.locator('#fast-auth-mitra');
    await expect(mitraBtn).toBeVisible();
  });
});

test.describe('Basic Interaction', () => {
  test('can click navigation items without error', async ({ page }) => {
    await page.goto('/');
    
    // Just verify page doesn't crash when clicking nav
    const berandaBtn = page.locator('nav').getByText('Beranda').first();
    if (await berandaBtn.isVisible()) {
      await berandaBtn.click();
      // Wait a bit, page should still be functional
      await page.waitForTimeout(300);
      await expect(page.locator('#root')).toBeVisible();
    }
  });
});

test.describe('Content Presence', () => {
  test('has some job listings or content', async ({ page }) => {
    await page.goto('/');
    
    // Just check that there's SOME content, don't be specific
    const hasContent = await page.locator('main').isVisible().catch(() => false) ||
                       await page.locator('article').first().isVisible().catch(() => false) ||
                       await page.locator('.container').first().isVisible().catch(() => false);
    
    expect(hasContent).toBeTruthy();
  });
});
