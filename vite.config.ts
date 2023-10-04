import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs-extra'
import { fileURLToPath } from 'url'
import path from 'path'

export default defineConfig(async ({}) => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const pkg = await fs.readJSON(path.resolve(__dirname, 'package.json'))
  return {
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
    define: {
      VERSION: JSON.stringify(pkg.version),
    },
  }
})
