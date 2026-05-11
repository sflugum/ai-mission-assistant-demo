import { test, expect } from '@playwright/test';

test('app loads and shows branding', async ({ page }) => {

  await page.goto('/');

  await expect(page).toHaveTitle(/AI Mission Assistant/);
});