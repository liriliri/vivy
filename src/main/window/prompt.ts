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
    maximized: store.get('maximized'),
    onSavePos: () => window.savePos(win, store, true),
  })
  win.on('close', () => {
    win?.destroy()
    win = null
  })

  window.loadPage(win, { page: 'prompt' })
}
