import { test, expect } from '@playwright/test'

test.describe('/api/generate-plan mocking', () => {
  test('shows API error message when Analyze returns JSON 500', async ({
    page
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })

    await page.route('**/api/generate-plan*', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue()
        return
      }

      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: "Failed to generate plan." })
      })
    })

    await page.goto('/mission/new')

    await page.getByRole('textbox').fill(
      'Launch regional supply audit with zero downtime.'
    )

    const respPromise = page.waitForResponse((r) =>
      r.url().includes('/api/generate-plan') && r.request().method() === 'POST'
    )
    await page.getByRole('button', { name: 'Analyze' }).click()
    const resp = await respPromise

    expect(resp.status()).toBe(500)

    await expect(page.getByText(/Failed to generate plan/i)).toBeVisible({ timeout: 10000 })

    await expect(page.getByRole('button', { name: 'Analyze' })).toBeEnabled()

    /** Full-page UX check (intercepted — no reliance on Docker backend). */
    await expect(page).toHaveScreenshot('analyze-500-json.png', {
      fullPage: true
    })
  })

  test('shows fallback error when Analyze returns opaque 500 body', async ({
    page
  }) => {
    await page.route('**/api/generate-plan*', async (route) => {
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

    const respPromise = page.waitForResponse((r) =>
      r.url().includes('/api/generate-plan') && r.request().method() === 'POST'
    )
    await page.getByRole('button', { name: 'Analyze' }).click()
    await respPromise

    await expect(page.getByTestId('error-message')).toBeVisible({ timeout: 10000 })
  })
})
