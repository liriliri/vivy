import path from 'path'
import { isDev } from '../../common/util'
import { BrowserWindow } from 'electron'
import * as window from '../lib/window'
import { getPromptStore } from '../lib/store'

const store = getPromptStore()

let win: BrowserWindow | null = null

export function showWin() {
  if (win) {
    win.focus()
    return
  }

  win = window.create({
    name: 'prompt',
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
    win.loadURL('http://localhost:8080/?page=prompt')
  } else {
    win.loadFile(path.resolve(__dirname, '../renderer/index.html'), {
      query: {
        page: 'prompt',
      },
    })
  }
}
