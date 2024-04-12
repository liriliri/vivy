import path from 'path'
import { isDev } from '../../common/util'
import { BrowserWindow } from 'electron'
import * as window from '../lib/window'
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
    minWidth: height,
    minHeight: height,
    resizable: false,
    ...store.get('bounds'),
    width,
    height,
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
