import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FRONTEND_PORT_CONFIG = path.resolve(__dirname, '../../../frontend/.port_config.json')

/**
 * Writes the bound backend port so the Vite dev server can read it (optional; env overrides).
 * @param {number} port
 */
export async function writeDevPortConfig(port) {
  const payload = {
    port,
    baseUrl: `http://localhost:${port}`
  }
  await fs.writeFile(
    FRONTEND_PORT_CONFIG,
    `${JSON.stringify(payload, null, 2)}\n`,
    'utf8'
  )
}
