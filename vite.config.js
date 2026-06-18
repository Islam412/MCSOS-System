import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://medical-center-app-production.up.railway.app',
        changeOrigin: true,
        secure: false,
        // ✅ rewrite: لا نحتاج نغير المسار لأن الـ API بيستقبل /api/v1/...
        // rewrite: (path) => path  // مش محتاجها لأنها default
      }
    }
  }
})