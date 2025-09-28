import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use relative base so the app can be hosted at any path (GitHub Pages, Vercel, etc.)
export default defineConfig({
  base: './',
  plugins: [react()],
})
