import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { mockAuthPlugin } from './vite-plugin-mock-auth'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), mockAuthPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
