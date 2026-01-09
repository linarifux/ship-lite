import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <--- Tailwind v4 Plugin
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://ship-lite.vercel.app', // Points to Backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
})