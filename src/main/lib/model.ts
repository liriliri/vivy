import path from 'path'
import { isDev } from './util'
import { BrowserWindow } from 'electron'

let win: BrowserWindow | null = null

export function showWin() {
  if (win) {
    win.focus()
    return
  }

  win = new BrowserWindow({
    title: 'Model Manager',
    width: 960,
    height: 640,
    minWidth: 960,
    minHeight: 640,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      webSecurity: false,
      sandbox: false,
    },
    show: false,
  })
  win.setMenu(null)
  win.once('ready-to-show', () => win?.show())
  win.on('close', () => {
    win?.destroy()
    win = null
  })

  if (isDev()) {
    win.loadURL('http://localhost:8080/?page=model')
  } else {
    win.loadFile(path.resolve(__dirname, '../renderer/index.html'), {
      query: {
        page: 'model',
      },
    })
  }
}
