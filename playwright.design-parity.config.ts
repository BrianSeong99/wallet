import { defineConfig } from '@playwright/test';

/**
 * Design-parity harness — compares the Crust design system against the shipped
 * extension build. See playwright/design-parity/parity.spec.ts for why the
 * extension is the target rather than the mobile bundle.
 *
 *   yarn test:design-parity
 *
 * Point CRUST_DESIGN_SYSTEM at the authoritative design-system/index.html if it
 * is not at the default path. Output lands in test-results/design-parity/.
 */
export default defineConfig({
  testDir: './playwright/design-parity',
  // Extensions only load in headed Chromium, and the two specs share one
  // persistent context per worker, so keep this serial.
  workers: 1,
  fullyParallel: false,
  timeout: 180_000,
  expect: { timeout: 20_000 },
  reporter: [['list']],
  use: {
    screenshot: 'off',
    video: 'off',
    trace: 'off'
  }
});
