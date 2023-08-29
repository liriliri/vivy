import path from 'path'
import isBuffer from 'licia/isBuffer'
import { createWin, isDev } from '../lib/util'
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

  win = createWin({
    minWidth: 960,
    minHeight: 640,
    ...store.get('bounds'),
    onSavePos: () => store.set('bounds', win?.getBounds()),
  })

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
