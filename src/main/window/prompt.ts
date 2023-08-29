import path from 'path'
import { createWin, isDev } from '../lib/util'
import { BrowserWindow } from 'electron'
import { attachTitlebarToWindow } from 'custom-electron-titlebar/main'

let win: BrowserWindow | null = null

export function showWin() {
  if (win) {
    win.focus()
    return
  }

  win = createWin({
    minWidth: 960,
    minHeight: 640,
    width: 960,
    height: 640,
  })
  win.on('close', () => {
    win?.destroy()
    win = null
  })

  if (isDev()) {
    win.loadURL('http://localhost:8080/?page=prompt')
  } else {
    win.loadFile(path.resolve(__dirname, '../renderer/index.html'), {
      query: {
        page: 'prompt',
      },
    })
  }
}
