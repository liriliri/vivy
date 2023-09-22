import path from 'path'
import { isDev } from '../lib/util'
import { BrowserWindow } from 'electron'
import { getTerminalStore } from '../lib/store'
import createWin from './createWin'

const store = getTerminalStore()

let win: BrowserWindow | null = null

export function showWin() {
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
