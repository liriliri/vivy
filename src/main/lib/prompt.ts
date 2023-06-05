import path from 'path'
import { isDev } from './util'
import { BrowserWindow } from 'electron'

let win: BrowserWindow | null = null

export function showWin() {
  if (win && !win.isDestroyed()) {
    win.focus()
    return
  }

  win = new BrowserWindow({
    title: 'Prompt Builder',
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
  win.setMenu(null)
  win.on('close', () => win?.destroy())

  if (isDev()) {
    win.loadURL('http://localhost:8080/prompt')
  }
}
