import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/common/components'),
      '@/hooks': path.resolve(__dirname, './src/common/hooks'),
      '@/services': path.resolve(__dirname, './src/common/services'),
      '@/types': path.resolve(__dirname, './src/common/types'),
      '@/utils': path.resolve(__dirname, './src/common/utils'),
      '@/stores': path.resolve(__dirname, './src/common/stores'),
    },
  },
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
