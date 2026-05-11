import { test, expect } from '@playwright/test'

/** Fixed layout so snapshots stay comparable cross-run on the same runner. */
test.use({
  viewport: { width: 1280, height: 840 }
})

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
})

test.describe('visual regression', () => {
  test('landing layout', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { level: 1, name: 'AI Mission Assistant' })
    ).toBeVisible()

    await expect(page).toHaveScreenshot('landing.png', { fullPage: true })
  })

  test('new mission workspace layout', async ({ page }) => {
    await page.goto('/mission/new')
    await expect(
      page.getByRole('button', { name: 'Analyze' })
    ).toBeVisible()

    await expect(page).toHaveScreenshot('mission-new.png', { fullPage: true })
  })
})
