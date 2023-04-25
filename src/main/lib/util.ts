import path from 'path'
import { fileURLToPath } from 'url'

export function isDev() {
  return import.meta.env.MODE === 'development'
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function resolve(p) {
  return path.resolve(__dirname, '../../', p)
}

export function isMac() {
  return process.platform === 'darwin'
}
