import path from 'path'
import { isDev } from '../lib/util'
import { BrowserWindow, ipcMain, app } from 'electron'
import * as webui from './webui'
import * as terminal from './terminal'
import * as model from './model'
import * as prompt from './prompt'
import { getMainStore } from '../lib/store'
import { bing, Language } from '../lib/translation'
import createWin from './createWin'

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

  win = createWin({
    minWidth: 1280,
    minHeight: 850,
    ...store.get('bounds'),
    onSavePos: () => store.set('bounds', win?.getBounds()),
    menu: true,
  })
  win.on('close', () => app.quit())

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
  ipcMain.handle('showPrompt', () => prompt.showWin())
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
