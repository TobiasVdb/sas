import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/sword/',
  plugins: [react()],
  publicDir: 'gameart',
  server: {
    port: 5172,
  },
})
