import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,

    // Development convenience: avoid CORS by proxying to the Express backend.
    proxy: {
      '/analyze': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})

