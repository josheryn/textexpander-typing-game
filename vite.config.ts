import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.PORT || '8080'),
    host: true,
    open: process.env.NODE_ENV !== 'production'
  },
  preview: {
    allowedHosts: ['textexpander-typing-game-pcac7.ondigitalocean.app', 'all']
  },
  base: './' // Add base path configuration for deployment
})
