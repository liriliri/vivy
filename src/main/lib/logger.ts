import path from 'path'
import { isDev } from './util'
import { BrowserWindow, ipcMain } from 'electron'

let win: BrowserWindow | null = null

let isIpcInit = false
export function showWin() {
  if (!isIpcInit) {
    isIpcInit = true
    initIpc()
  }

  if (win && !win.isDestroyed()) {
    win.focus()
    return
  }

  win = new BrowserWindow({
    title: 'Logger',
    width: 960,
    height: 640,
    minWidth: 960,
    minHeight: 640,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      webSecurity: false,
      sandbox: false,
    },
  })
  win.setMenu(null)
  win.on('close', () => win?.destroy())

  if (isDev()) {
    win.loadURL('http://localhost:8080/logger')
  }
}

function initIpc() {
  ipcMain.handle('getLogs', () => {
    return []
  })
}
