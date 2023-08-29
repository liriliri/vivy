import path from 'path'
import isBuffer from 'licia/isBuffer'
import { isDev } from '../lib/util'
import { BrowserWindow, ipcMain } from 'electron'
import { getTerminalStore } from '../lib/store'
import { attachTitlebarToWindow } from 'custom-electron-titlebar/main'

const store = getTerminalStore()

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
    titleBarStyle: 'hidden',
    titleBarOverlay: true,
    ...store.get('bounds'),
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
  attachTitlebarToWindow(win)
  win.setMinimumSize(960, 640)

  win.once('ready-to-show', () => win?.show())
  win.on('close', () => {
    win?.destroy()
    win = null
  })
  const savePos = () => store.set('bounds', win?.getBounds())
  win.on('resize', savePos)
  win.on('moved', savePos)

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
