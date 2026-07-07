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
  const env = loadEnv(mode, process.cwd(), '');
  const envProxyTarget = (process.env.VITE_PROXY_TARGET || env.VITE_PROXY_TARGET || '').trim()
  const initialProxyTarget = envProxyTarget || readBackendPortConfigBaseUrl() || 'http://localhost:3001'

  /** Re-read port file each request so a backend port change does not require restarting Vite. */
  function resolveProxyTarget() {
    if (envProxyTarget) return envProxyTarget
    return readBackendPortConfigBaseUrl() || 'http://localhost:3001'
  }

  if (!envProxyTarget) {
    const fromFile = readBackendPortConfigBaseUrl()
    if (fromFile) {
      // eslint-disable-next-line no-console
      console.info(`[vite] API proxy → ${fromFile} (from .port_config.json; refreshed per request)`)
    } else {
      // eslint-disable-next-line no-console
      console.info(`[vite] API proxy → ${initialProxyTarget} (default; start the backend to avoid 502)`)
    }
  } else {
    // eslint-disable-next-line no-console
    console.info(`[vite] API proxy → ${envProxyTarget} (VITE_PROXY_TARGET)`)
  }

  const apiProxy = {
    target: initialProxyTarget,
    changeOrigin: true,
    router: () => resolveProxyTarget(),
    bypass(req) {
      if (req.headers.accept?.includes('text/html')) {
        return '/index.html';
      }
      return null;
    }
  }

  return defineConfig({
    plugins: [
      react()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    envPrefix: ['VITE_'],
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': apiProxy
      }
    },
    build: {
      sourcemap: true,
    }
  })
}
