import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Host dev defaults to localhost; Docker compose sets VITE_PROXY_TARGET=http://backend:3001.
const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:3001'

export default defineConfig({
  plugins: [react()],
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

