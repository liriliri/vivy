import { app, BrowserWindow } from 'electron'
import { isDev } from './lib/util'
import * as webui from './lib/webui'
import * as menu from './lib/menu'
import * as ipc from './lib/ipc'
import path from 'path'

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null

async function createWin() {
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
  }
}

app.setName('Vivy')

app.on('ready', () => {
  webui.start()
  ipc.init()
  createWin()
  menu.init()
})

app.on('second-instance', () => {
  if (win) {
    if (win.isMaximized()) {
      win.restore()
    }
    win.focus()
  }
})
