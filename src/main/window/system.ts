import path from 'path'
import { isDev } from '../../common/util'
import { BrowserWindow } from 'electron'
import * as window from '../lib/window'
import { getSystemStore } from '../lib/store'

const store = getSystemStore()

let win: BrowserWindow | null = null

export function showWin() {
  if (win) {
    win.focus()
    return
  }

  win = window.create({
    minWidth: 960,
    minHeight: 300,
    resizable: false,
    ...store.get('bounds'),
    width: 960,
    height: 300,
    onSavePos: () => store.set('bounds', win?.getBounds()),
  })
  win.on('close', () => {
    win?.destroy()
    win = null
  })

  if (isDev()) {
    win.loadURL('http://localhost:8080/?page=system')
  } else {
    win.loadFile(path.resolve(__dirname, '../renderer/index.html'), {
      query: {
        page: 'system',
      },
    })
  }
}
