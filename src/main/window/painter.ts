import { BrowserWindow } from 'electron'
import { getPainterStore } from '../lib/store'
import * as window from '../lib/window'
import { isDev } from '../../common/util'
import path from 'path'

const store = getPainterStore()

let win: BrowserWindow | null = null
let currentMode = ''

export function showWin(mode: 'sketch' | 'mask') {
  if (win) {
    loadUrl(mode)
    win.focus()
    return
  }

  win = window.create({
    name: 'painter',
    minWidth: 960,
    minHeight: 640,
    ...store.get('bounds'),
    maximized: store.get('maximized'),
    onSavePos: () => window.savePos(win, store, true),
  })
  win.on('close', () => {
    win?.destroy()
    win = null
    currentMode = ''
  })

  loadUrl(mode)
}

function loadUrl(mode: string) {
  if (currentMode === mode) {
    return
  }

  currentMode = mode

  if (win) {
    if (isDev()) {
      win.loadURL(`http://localhost:8080/?page=painter&&mode=${mode}`)
    } else {
      win.loadFile(path.resolve(__dirname, '../renderer/index.html'), {
        query: {
          page: 'painter',
          mode,
        },
      })
    }
  }
}

export function closeWin() {
  if (win) {
    win.close()
  }
}
