import path from 'path'
import { isDev } from './util'
import { BrowserWindow } from 'electron'
import { attachTitlebarToWindow } from 'custom-electron-titlebar/main'
import { getModelStore } from './store'

const store = getModelStore()

let win: BrowserWindow | null = null

export function showWin() {
  if (win) {
    win.focus()
    return
  }

  win = new BrowserWindow({
    title: 'Model Manager',
    titleBarStyle: 'hidden',
    titleBarOverlay: true,
    ...store.get('bounds'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      webSecurity: false,
      sandbox: false,
    },
    show: false,
  })
  win.setMenu(null)
  attachTitlebarToWindow(win)
  win.setMinimumSize(960, 640)
  win.once('ready-to-show', () => win?.show())
  win.on('close', () => {
    win?.destroy()
    win = null
  })
  const savePos = () => store.set('bounds', win?.getBounds())
  win.on('resize', savePos)
  win.on('moved', savePos)

  if (isDev()) {
    win.loadURL('http://localhost:8080/?page=model')
  } else {
    win.loadFile(path.resolve(__dirname, '../renderer/index.html'), {
      query: {
        page: 'model',
      },
    })
  }
}
