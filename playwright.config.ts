import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Test Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  
  /* Run tests in files in parallel */
  fullyParallel: false,

  /* Serial workers — Vite dev raksasa (AdminDashboard 500KB+), parallel = timeout/OOM */
  workers: 1,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Reporter untuk output test */
  reporter: 'html',
  
  /* Shared settings untuk semua projects */
  use: {
    /* Base URL untuk simplifikasi navigation */
    baseURL: 'http://localhost:3000',
    
    /* Collect trace ketika test fail */
    trace: 'on-first-retry',
    
    /* Screenshot ketika test fail */
    screenshot: 'only-on-failure',
  },

  /* Configure projects untuk multiple browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      // Role-switcher dev-only digate env ini — test butuh tombolnya tampil.
      VITE_ENABLE_FAST_AUTH: 'true',
    },
  },
});
