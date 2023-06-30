import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '',
  plugins: [react()],
  build: {
    outDir: 'dist/renderer',
    rollupOptions: {
      input: {
        app: './index.html',
      },
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  server: {
    port: 8080,
  },
})
