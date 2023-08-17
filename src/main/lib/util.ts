import path from 'path'
import contain from 'licia/contain'
import { app } from 'electron'
import { fileURLToPath } from 'url'
import I18n from 'licia/I18n'
import defaults from 'licia/defaults'
import types from 'licia/types'
import enUS from '../../common/locales/en-US.json'
import zhCN from '../../common/locales/zh-CN.json'

export const i18n = new I18n('en-US', {
  enUS,
  zhCN: defaults(zhCN, enUS),
})

export function t(path: string | string[], data?: types.PlainObj<any>) {
  return i18n.t(path, data)
}

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
