import path from 'path'
import contain from 'licia/contain'
import { app } from 'electron'
import { fileURLToPath } from 'url'

export function isDev() {
  return import.meta.env.MODE === 'development'
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function resolve(p) {
  if (isDev()) {
    return path.resolve(__dirname, '../../', p)
  } else {
    return path.resolve(__dirname, '../', p)
  }
}

export function resolveUnpack(p) {
  const path = resolve(p)

  if (!isDev() && contain(path, 'app.asar')) {
    return path.replace('app.asar', 'app.asar.unpacked')
  }

  return path
}

export function isMac() {
  return process.platform === 'darwin'
}

export function getUserDataPath(p: string) {
  return path.resolve(app.getPath('appData'), 'vivy', p)
}
