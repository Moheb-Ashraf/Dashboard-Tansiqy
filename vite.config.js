import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/proxy': {
        target: 'http://tansiqy.runasp.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/proxy\?path=/, ''),
      }
    }
  }
})