import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @param {unknown} mode */
export default ({ mode }) => {
  loadEnv(mode, '.', '')
  // Host dev defaults to localhost; Docker compose sets VITE_PROXY_TARGET=http://backend:3001.
  const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:3001'

  return defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    envPrefix: ['VITE_'],
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
      passWithNoTests: true
    },
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
