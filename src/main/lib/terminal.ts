import path from 'path'
import isBuffer from 'licia/isBuffer'
import { isDev } from './util'
import { BrowserWindow, ipcMain } from 'electron'

let win: BrowserWindow | null = null

let isIpcInit = false
export function showWin() {
  if (!isIpcInit) {
    isIpcInit = true
    initIpc()
  }

  if (win) {
    win.focus()
    return
  }

  win = new BrowserWindow({
    title: 'Terminal',
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
    backgroundColor: '#000',
  })
  if (!isDev()) {
    win.setMenu(null)
  }

  win.once('ready-to-show', () => win?.show())
  win.on('close', () => {
    win?.destroy()
    win = null
  })

  if (isDev()) {
    win.loadURL('http://localhost:8080/?page=terminal')
  } else {
    win.loadFile(path.resolve(__dirname, '../renderer/index.html'), {
      query: {
        page: 'terminal',
      },
    })
  }
}

function initIpc() {
  ipcMain.handle('getLogs', () => logs)
}

const logs: string[] = []

export function init() {
  const stdoutWrite = process.stdout.write
  const stderrWrite = process.stderr.write

  process.stdout.write = function (...args) {
    addLog(args[0])

    return stdoutWrite.apply(process.stdout, args as any)
  }

  process.stderr.write = function (...args) {
    addLog(args[0])

    return stderrWrite.apply(process.stderr, args as any)
  }

  function addLog(data: string | Buffer) {
    if (isBuffer(data)) {
      data = data.toString('utf8')
    }
    logs.push(data as string)
    if (win) {
      win.webContents.send('addLog', data)
    }
  }
}
