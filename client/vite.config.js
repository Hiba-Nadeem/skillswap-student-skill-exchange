import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Any request starting with /api is forwarded to the Express backend,
    // so the frontend can call "/api/..." without worrying about CORS or ports.
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
