import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron'
import noop from 'licia/noop'
import types from 'licia/types'
import defaults from 'licia/defaults'
import path from 'path'
import { attachTitlebarToWindow } from 'custom-electron-titlebar/main'
import { getSettingsStore } from '../lib/store'
import { colorBgContainer, colorBgContainerDark } from '../../common/theme'

const settingsStore = getSettingsStore()

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

export default function createWin(opts: IWinOptions) {
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
  const theme = settingsStore.get('theme')
  if (theme) {
    options.backgroundColor =
      theme === 'dark' ? colorBgContainerDark : colorBgContainer
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
  const onSavePos = () => {
    if (!win.isMaximized()) {
      winOptions.onSavePos()
    }
  }
  win.on('resize', onSavePos)
  win.on('moved', onSavePos)
  win.once('ready-to-show', () => win.show())
  if (winOptions.customTitlebar) {
    attachTitlebarToWindow(win)
    win.setMinimumSize(winOptions.minWidth, winOptions.minHeight)
  }

  return win
}
