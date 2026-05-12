import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function readBackendPortConfigBaseUrl() {
  // Written by the local Express dev server when it picks a listen port (see backend `writeDevPortConfig`).
  const configPath = path.join(__dirname, '.port_config.json')
  try {
    const raw = fs.readFileSync(configPath, 'utf8')
    const data = JSON.parse(raw)
    if (typeof data.baseUrl === 'string' && data.baseUrl.startsWith('http')) {
      return data.baseUrl
    }
    if (typeof data.port === 'number' && Number.isFinite(data.port)) {
      return `http://localhost:${data.port}`
    }
  } catch {
    // optional file — ignore missing/invalid JSON
  }
  return null
}

/** @param {unknown} mode */
export default ({ mode }) => {
  loadEnv(mode, '.', '')
  const fromPortFile = readBackendPortConfigBaseUrl()
  // VITE_PROXY_TARGET wins (e.g. Docker: http://backend:3001). Else optional frontend/.port_config.json from the backend dev server.
  const proxyTarget = process.env.VITE_PROXY_TARGET || fromPortFile || 'http://localhost:3001'
  if (!process.env.VITE_PROXY_TARGET && fromPortFile) {
    // eslint-disable-next-line no-console
    console.info(`[vite] /analyze proxy → ${fromPortFile} (from .port_config.json)`)
  }

  return defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    envPrefix: ['VITE_'],
    server: {
      port: 5173,
      strictPort: true,

      // Development convenience: avoid CORS by proxying to the Express backend.
      proxy: {
        '/analyze': {
          target: proxyTarget,
          changeOrigin: true
        }
      }
    }
  })
}
