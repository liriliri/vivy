import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron'
import noop from 'licia/noop'
import types from 'licia/types'
import defaults from 'licia/defaults'
import remove from 'licia/remove'
import each from 'licia/each'
import path from 'path'
import { attachTitlebarToWindow } from 'custom-electron-titlebar/main'
import { colorBgContainer, colorBgContainerDark } from '../../common/theme'
import { getTheme } from './util'

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
  resizable?: boolean
}

const visibleWins: BrowserWindow[] = []
let focusedWin: BrowserWindow | null = null

export function create(opts: IWinOptions) {
  defaults(opts, {
    customTitlebar: true,
    preload: true,
    minWidth: 1280,
    minHeight: 850,
    width: 1280,
    height: 850,
    onSavePos: noop,
    menu: false,
    resizable: true,
  })
  const winOptions = opts as Required<IWinOptions>

  const options: BrowserWindowConstructorOptions = {
    minWidth: winOptions.minWidth,
    minHeight: winOptions.minHeight,
    width: winOptions.width,
    height: winOptions.height,
    show: false,
    resizable: winOptions.resizable,
  }
  options.backgroundColor = getTheme() ? colorBgContainerDark : colorBgContainer
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
  const onSavePos = () => {
    if (!win.isMaximized() && !win.isFullScreen()) {
      winOptions.onSavePos()
    }
  }
  win.on('resize', onSavePos)
  win.on('moved', onSavePos)
  win.once('ready-to-show', () => win.show())
  win.on('show', () => visibleWins.push(win))
  win.on('focus', () => (focusedWin = win))
  win.on('closed', () => remove(visibleWins, (window) => window === win))

  if (winOptions.customTitlebar) {
    attachTitlebarToWindow(win)
    win.setMinimumSize(winOptions.minWidth, winOptions.minHeight)
  }

  return win
}

export function sendAll(channel: string, ...args: any[]) {
  each(visibleWins, (win) => {
    win.webContents.send(channel, ...args)
  })
}

export function sendFocused(channel: string, ...args: any[]) {
  if (focusedWin) {
    focusedWin.webContents.send(channel, ...args)
  }
}
