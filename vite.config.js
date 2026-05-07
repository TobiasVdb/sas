import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const base = process.env.APP_BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [react()],
  publicDir: 'gameart',
  server: {
    port: 5172,
  },
})
