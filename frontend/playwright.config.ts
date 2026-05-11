import { defineConfig, devices } from '@playwright/test'

/** Dedicated port so E2E never attaches to another stack (e.g. Docker) on 5173. */
const E2E_PORT = 5174

export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: `http://127.0.0.1:${E2E_PORT}`,
    ...devices['Desktop Chrome']
  },
  webServer: {
    command: `npx vite --port ${E2E_PORT} --strictPort --host 127.0.0.1`,
    url: `http://127.0.0.1:${E2E_PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000
  }
})
