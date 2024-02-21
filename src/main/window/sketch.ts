import { BrowserWindow } from 'electron'
import { getSketchStore } from '../lib/store'
import * as window from '../lib/window'
import { isDev } from '../lib/util'
import path from 'path'

const store = getSketchStore()

let win: BrowserWindow | null = null

export function showWin() {
  if (win) {
    win.focus()
    return
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
    win.loadURL('http://localhost:8080/?page=sketch')
  } else {
    win.loadFile(path.resolve(__dirname, '../renderer/index.html'), {
      query: {
        page: 'sketch',
      },
    })
  }
}

export function closeWin() {
  if (win) {
    win.close()
  }
}
