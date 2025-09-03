import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// If we later need React plugin features; for now, vanilla works too
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  }
})

