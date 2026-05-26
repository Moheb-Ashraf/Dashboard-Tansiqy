import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const API_TARGET = 'https://tansiqy.runasp.net'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/proxy': {
        target: API_TARGET,
        changeOrigin: true,
        secure: true,
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq, req) => {
            const url = new URL(req.url || '', 'http://localhost')
            const apiPath = url.searchParams.get('path')
            if (!apiPath) return

            const cleanPath = apiPath.startsWith('/') ? apiPath : `/${apiPath}`
            url.searchParams.delete('path')
            const query = url.searchParams.toString()
            proxyReq.path = query ? `${cleanPath}?${query}` : cleanPath
          })
        },
      },
    },
  },
})
