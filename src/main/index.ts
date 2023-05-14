import { app, BrowserWindow } from 'electron'
import { isDev } from './lib/util'
import * as easyDiffusion from './lib/easyDiffusion'
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
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      webSecurity: false,
    },
  })

  if (isDev()) {
    win.loadURL('http://localhost:8080')
  }
}

app.setName('Vivy')

app.on('ready', () => {
  easyDiffusion.start()
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
