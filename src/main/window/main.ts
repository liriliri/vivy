import path from 'path'
import { isDev } from '../lib/util'
import { BrowserWindow, ipcMain, app } from 'electron'
import * as webui from './webui'
import * as terminal from './terminal'
import * as model from './model'
import { getMainStore } from '../lib/store'
import { attachTitlebarToWindow } from 'custom-electron-titlebar/main'
import { bing, Language } from '../lib/translation'

const store = getMainStore()

let win: BrowserWindow | null = null

export function getWin() {
  return win
}

let isIpcInit = false

export function showWin() {
  if (!isIpcInit) {
    isIpcInit = true
    initIpc()
  }

  win = new BrowserWindow({
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
  attachTitlebarToWindow(win)
  win.setMinimumSize(1280, 850)
  win.once('ready-to-show', () => win?.show())
  win.on('close', () => app.quit())
  const savePos = () => store.set('bounds', win?.getBounds())
  win.on('resize', savePos)
  win.on('moved', savePos)

  if (isDev()) {
    win.loadURL('http://localhost:8080')
  } else {
    win.loadFile(path.resolve(__dirname, '../renderer/index.html'))
  }
}

function initIpc() {
  ipcMain.handle('getWebuiPort', () => webui.getPort())
  ipcMain.handle('showTerminal', () => terminal.showWin())
  ipcMain.handle('showModel', () => model.showWin())
  ipcMain.handle('setMainStore', (_, name, val) => store.set(name, val))
  ipcMain.handle('getMainStore', (_, name) => store.get(name))
  ipcMain.handle('relaunch', () => {
    webui.quit()
    app.relaunch()
    app.exit()
  })
  ipcMain.handle('translate', async (_, text) => {
    return await bing(text, Language.zhCN, Language.enUS)
  })
}
