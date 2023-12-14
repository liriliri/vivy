import path from 'path'
import { isDev } from '../lib/util'
import { BrowserWindow, ipcMain } from 'electron'
import { getTerminalStore } from '../lib/store'
import * as window from '../lib/window'
import isWindows from 'licia/isWindows'
import contain from 'licia/contain'
import isBuffer from 'licia/isBuffer'

const store = getTerminalStore()

let win: BrowserWindow | null = null
let isIpcInit = false

export function showWin() {
  if (win) {
    win.focus()
    return
  }

  if (!isIpcInit) {
    isIpcInit = true
    initIpc()
  }

  win = window.create({
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
    if (isWindows && contain(data, '|')) {
      data = (data as string).replace(/\ufffd/g, '█')
    }
    logs.push(data as string)
    window.sendAll('addLog', data)
  }
}

function initIpc() {
  ipcMain.handle('getLogs', () => logs)
}
