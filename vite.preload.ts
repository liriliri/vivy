import { defineConfig } from 'vite'
import { resolve } from 'path'
import { builtinModules } from 'node:module'

const builtins = builtinModules.filter((e) => !e.startsWith('_'))
builtins.push(
  'electron',
  'stable-diffusion-api',
  ...builtins.map((m) => `node:${m}`)
)

export default defineConfig({
  build: {
    outDir: 'dist/preload',
    lib: {
      entry: resolve(__dirname, 'src/preload/index.ts'),
      name: 'Main',
      fileName: 'index',
      formats: ['cjs'],
    },
    rollupOptions: {
      external: builtins,
    },
  },
  resolve: {
    browserField: false,
  },
})
