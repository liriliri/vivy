import path from 'path'
import contain from 'licia/contain'
import { app, nativeTheme } from 'electron'
import { fileURLToPath } from 'url'
import { isDev } from 'share/common/util'
import splitPath from 'licia/splitPath'

// @ts-ignore
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

export function getUserDataPath(p: string) {
  return path.resolve(app.getPath('appData'), 'vivy', p)
}

export function replaceExt(file, newExt) {
  const { ext } = splitPath(file)
  return file.replace(ext, newExt)
}

export function getTheme() {
  if (nativeTheme.themeSource === 'system') {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
  }

  return nativeTheme.themeSource
}
