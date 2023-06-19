import path from 'path'
import { isDev } from './util'
import { BrowserWindow } from 'electron'

let win: BrowserWindow | null = null

export function getWin() {
  return win
}

export function showWin() {
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
    win.loadFile('renderer/index.html')
  }
}
