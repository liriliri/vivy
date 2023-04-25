import { app, BrowserWindow } from 'electron'
import { isDev } from './lib/util'
import getPort from 'licia/getPort'
import * as easyDiffusion from './lib/easyDiffusion'
import * as menu from './lib/menu'

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null

async function createWindow() {
  win = new BrowserWindow({
    title: 'VIVY',
  })

  if (isDev()) {
    win.loadURL('http://localhost:8080')
  }
}

app.on('ready', createWindow)
app.on('ready', async () => {
  const port = await getPort(9000)
  easyDiffusion.start(port)
})
app.on('ready', () => {
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
