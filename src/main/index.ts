import { app, BrowserWindow } from 'electron'

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null

async function createWindow() {
  win = new BrowserWindow({})

  if (import.meta.env.MODE === 'development') {
    win.loadURL('http://localhost:8080')
  }
}

app.on('ready', createWindow)

app.on('second-instance', () => {
  if (win) {
    if (win.isMaximized()) {
      win.restore()
    }
    win.focus()
  }
})
