import { BrowserWindow } from 'electron'
import createWin from './createWin'
import { isDev } from '../lib/util'
import path from 'path'
import { getDownloadStore } from '../lib/store'

const store = getDownloadStore()

let win: BrowserWindow | null = null

export function showWin() {
  if (win) {
    win.focus()
    return
  }

  win = createWin({
    minWidth: 640,
    minHeight: 480,
    ...store.get('bounds'),
    onSavePos: () => store.set('bounds', win?.getBounds()),
  })
  win.on('close', () => {
    win?.destroy()
    win = null
  })

  if (isDev()) {
    win.loadURL('http://localhost:8080/?page=download')
  } else {
    win.loadFile(path.resolve(__dirname, '../renderer/index.html'), {
      query: {
        page: 'download',
      },
    })
  }
}
