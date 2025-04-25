import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/bgroup3/test2/halocare/',
  plugins: [react()],
})
