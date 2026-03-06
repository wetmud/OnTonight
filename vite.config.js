import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // base: '/eventpulse/', ← was needed for GitHub Pages; Vercel uses '/' (the default)
})
