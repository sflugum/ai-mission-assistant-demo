import { test, expect } from '@playwright/test'

test.describe('/api/generate-plan mocking', () => {
  test('shows API error message when Analyze returns JSON 500', async ({
    page
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })

    await page.route('**/api/generate-plan', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue()
        return
      }

      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' })
      })
    })

    await page.goto('/mission/new')

    await page.getByRole('textbox').fill(
      'Launch regional supply audit with zero downtime.'
    )
    await page.getByRole('button', { name: 'Analyze' }).click()

    await expect(
      page.getByText('Internal Server Error', { exact: true })
    ).toBeVisible()

    await expect(page.getByRole('button', { name: 'Analyze' })).toBeEnabled()

    /** Full-page UX check (intercepted — no reliance on Docker backend). */
    await expect(page).toHaveScreenshot('analyze-500-json.png', {
      fullPage: true
    })
  })

  test('shows fallback error when Analyze returns opaque 500 body', async ({
    page
  }) => {
    await page.route('**/api/generate-plan', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue()
        return
      }

      await route.fulfill({
        status: 500,
        contentType: 'text/plain',
        body: ''
      })
    })

    await page.goto('/mission/new')
    await page.getByRole('textbox').fill('Mission brief.')
    await page.getByRole('button', { name: 'Analyze' }).click()

    await expect(page.getByText(/^Request failed: 500$/)).toBeVisible()
  })
})
