import { test, expect } from '@playwright/test';

// Minimal "did the app even boot" check, kept separate from the more
// detailed landing page test so a basic deploy/build failure shows up as
// its own clearly-named failure instead of getting buried in a bigger test.
test('app loads and shows branding', async ({ page }) => {

  await page.goto('/');

  await expect(page).toHaveTitle(/AI Mission Assistant/);
});