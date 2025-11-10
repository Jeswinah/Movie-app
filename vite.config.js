import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(),react()],
  server: {
    cors: true,
    proxy: {
      // Optional: proxy TMDB API calls to avoid CORS (not needed for current setup)
      // '/api': {
      //   target: 'https://api.themoviedb.org',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, '')
      // }
    }
  }
})
