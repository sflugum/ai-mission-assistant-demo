import { defineConfig, devices } from '@playwright/test'

/** Dedicated port so E2E never attaches to another stack (e.g. Docker) on 5173. */
const E2E_PORT = 5174

export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  snapshotPathTemplate: '{testDir}/snapshots/{testFileName}/{arg}{ext}',
  fullyParallel: true,
  reporter: 'html',

  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.04,
      threshold: 0.25
    }
  },

  use: {
    baseURL: `http://127.0.0.1:${E2E_PORT}`,
    colorScheme: 'dark'
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: {
    command: `npx vite --port ${E2E_PORT} --strictPort --host 127.0.0.1`,
    url: `http://127.0.0.1:${E2E_PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,

    env: {
      /** Deterministic missions list during E2E (no flaky loading / staging data). */
      VITE_SUPABASE_URL: '',
      VITE_SUPABASE_ANON_KEY: '',
      VITE_API_URL: ''
    }
  }
})
