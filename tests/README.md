# E2E Testing dengan Playwright

Setup testing otomatis untuk Portal CDC UMK Kendari menggunakan Playwright.

## Quick Start

```bash
# Run semua test (headless)
npm test

# Run dengan UI mode (interactive)
npm run test:ui

# Run dengan browser visible
npm run test:headed

# Debug mode (step-by-step)
npm run test:debug

# Generate test code otomatis
npm run test:codegen
```

## Structure

```
tests/
├── example.spec.ts          # Contoh test suite
└── README.md               # Dokumentasi ini
```

## Writing Tests

Template dasar:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/path');
    
    // Your test assertions
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

## Best Practices

1. **Gunakan data-testid** untuk selector yang stable
2. **Isolasi test** - setiap test harus independen
3. **Cleanup** - reset state setelah test
4. **Parallelize** - test berjalan parallel by default
5. **Screenshot/Trace** - otomatis capture saat test fail

## Resources

- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors](https://playwright.dev/docs/selectors)
