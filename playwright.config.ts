import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from '@playwright/test'
import frontend from './frontend/playwright.config.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendDir = path.join(__dirname, 'frontend')

/**
 * When Playwright is started from the monorepo root without a config, it uses
 * testDir = cwd and the default test file glob, so Vitest unit tests (*.test.js)
 * get loaded and @vitest/expect clashes with Playwright's expect.
 */
export default defineConfig({
  ...frontend,
  testDir: path.join(frontendDir, 'e2e'),
  webServer: frontend.webServer
    ? { ...frontend.webServer, cwd: frontendDir }
    : undefined
})
