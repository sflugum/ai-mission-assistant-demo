import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test('shows assistant heading and opens a new mission workspace', async ({
    page
  }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { level: 1, name: 'AI Mission Assistant' })
    ).toBeVisible()
    await page.getByRole('button', { name: 'Start new mission' }).click()
    await expect(page).toHaveURL(/\/mission\/new$/)
  })
})
