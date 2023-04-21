import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    outDir: 'dist/main',
    lib: {
      entry: resolve(__dirname, 'src/main/index.ts'),
      name: 'Main',
      fileName: 'index',
      formats: ['cjs'],
    },
  },
})
