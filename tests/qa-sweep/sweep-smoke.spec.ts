import { test, expect } from '@playwright/test';
import { collectErrors, gotoHome, expectClean } from './helpers';

test.describe('QA Sweep 0: Smoke', () => {
  test('homepage load tanpa error kritis', async ({ page }) => {
    const get = await collectErrors(page);
    await gotoHome(page);
    await expect(page).toHaveTitle(/Portal CDC UM Kendari/i);
    expectClean(get());
  });
});
