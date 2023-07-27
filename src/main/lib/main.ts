import path from 'path'
import { isDev } from './util'
import { BrowserWindow, ipcMain } from 'electron'
import * as webui from './webui'
import * as logger from './logger'

let win: BrowserWindow | null = null

export function getWin() {
  return win
}

let isIpcInit = false

export function showWin() {
  if (!isIpcInit) {
    isIpcInit = true
    initIpc()
  }

  win = new BrowserWindow({
    title: 'VIVY',
    width: 1280,
    height: 850,
    minWidth: 1280,
    minHeight: 850,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      webSecurity: false,
      sandbox: false,
    },
  })

  if (isDev()) {
    win.loadURL('http://localhost:8080')
  } else {
    win.loadFile(path.resolve(__dirname, '../renderer/index.html'))
  }
}

function initIpc() {
  ipcMain.handle('getWebuiPort', () => webui.getPort())
  ipcMain.handle('showLogger', () => logger.showWin())
}
