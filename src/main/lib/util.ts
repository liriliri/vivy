import path from 'path'
import contain from 'licia/contain'
import { BrowserWindow, BrowserWindowConstructorOptions, app } from 'electron'
import { fileURLToPath } from 'url'
import I18n from 'licia/I18n'
import defaults from 'licia/defaults'
import types from 'licia/types'
import noop from 'licia/noop'
import enUS from '../../common/locales/en-US.json'
import zhCN from '../../common/locales/zh-CN.json'
import { attachTitlebarToWindow } from 'custom-electron-titlebar/main'

export const i18n = new I18n('en-US', {
  'en-US': enUS,
  'zh-CN': defaults(zhCN, enUS),
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

interface IWinOptions {
  customTitlebar?: boolean
  minWidth?: number
  minHeight?: number
  width?: number
  height?: number
  preload?: boolean
  menu?: boolean
  x?: number
  y?: number
  onSavePos?: types.AnyFn
}

export function createWin(opts: IWinOptions) {
  defaults(opts, {
    customTitlebar: true,
    preload: true,
    minWidth: 1280,
    minHeight: 850,
    width: 1280,
    height: 850,
    onSavePos: noop,
    menu: false,
  })
  const winOptions = opts as Required<IWinOptions>

  const options: BrowserWindowConstructorOptions = {
    minWidth: winOptions.minWidth,
    minHeight: winOptions.minHeight,
    width: winOptions.width,
    height: winOptions.height,
    show: false,
  }
  if (winOptions.x) {
    options.x = winOptions.x
  }
  if (winOptions.y) {
    options.y = winOptions.y
  }
  if (winOptions.preload) {
    options.webPreferences = {
      preload: path.join(__dirname, '../preload/index.js'),
      webSecurity: false,
      sandbox: false,
    }
  }
  if (winOptions.customTitlebar) {
    options.titleBarStyle = 'hidden'
    options.titleBarOverlay = true
  }

  const win = new BrowserWindow(options)
  if (!winOptions.menu) {
    win.setMenu(null)
  }
  win.on('resize', winOptions.onSavePos)
  win.on('moved', winOptions.onSavePos)
  win.once('ready-to-show', () => win.show())
  if (winOptions.customTitlebar) {
    attachTitlebarToWindow(win)
    win.setMinimumSize(winOptions.minWidth, winOptions.minHeight)
  }

  return win
}
