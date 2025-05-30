import { BrowserWindow } from 'electron'
import * as window from 'share/main/lib/window'
import { getSettingsStore, getSystemStore } from '../lib/store'
import startWith from 'licia/startWith'

const store = getSystemStore()
const settingsStore = getSettingsStore()

let win: BrowserWindow | null = null

export function showWin() {
  if (win) {
    win.focus()
    return
  }

  const width = 960
  let height = 300

  if (startWith(settingsStore.get('device'), 'cuda')) {
    height = 435
  }

  win = window.create({
    name: 'system',
    resizable: false,
    ...store.get('bounds'),
    width,
    height,
    onSavePos: () => window.savePos(win, store),
  })
  win.on('close', () => {
    win?.destroy()
    win = null
  })

  window.loadPage(win, { page: 'system' })
}
