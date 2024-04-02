import path from 'path'
import { isDev } from '../../common/util'
import { BrowserWindow, ipcMain, app, clipboard } from 'electron'
import { getMainStore, getSettingsStore } from '../lib/store'
import { bing, google, Language } from '../lib/translator'
import * as window from '../lib/window'
import * as webui from './webui'
import * as model from '../lib/model'
import convertBin from 'licia/convertBin'

const store = getMainStore()
const settingsStore = getSettingsStore()

let win: BrowserWindow | null = null

export function getWin() {
  return win
}

let isIpcInit = false
let quitApp = false

export function showWin() {
  if (win) {
    win.focus()
    return
  }

  if (!isIpcInit) {
    isIpcInit = true
    initIpc()
  }

  win = window.create({
    minWidth: 1280,
    minHeight: 850,
    ...store.get('bounds'),
    onSavePos: () => store.set('bounds', win?.getBounds()),
    menu: true,
  })
  win.on('close', (e) => {
    if (!quitApp) {
      e.preventDefault()
      win?.webContents.send('closeMain')
    }
  })

  if (isDev()) {
    win.loadURL('http://localhost:8080')
  } else {
    win.loadFile(path.resolve(__dirname, '../renderer/index.html'))
  }
}

function initIpc() {
  ipcMain.handle('quitApp', () => {
    quitApp = true
    app.quit()
  })
  ipcMain.handle('setMainStore', (_, name, val) => store.set(name, val))
  ipcMain.handle('getMainStore', (_, name) => store.get(name))
  ipcMain.handle('isModelExists', (_, type, name) => model.exists(type, name))
  store.on('change', (name, val) => {
    window.sendAll('changeMainStore', name, val)
  })
  ipcMain.handle('translate', async (_, text) => {
    let translator: typeof bing | null = null
    switch (settingsStore.get('translator')) {
      case 'bing':
        translator = bing
        break
      case 'google':
        translator = google
        break
    }

    if (translator) {
      return await translator(text, Language.zhCN, Language.enUS)
    }

    return text
  })

  ipcMain.handle('setSettingsStore', (_, name, val) => {
    settingsStore.set(name, val)
  })
  ipcMain.handle('getSettingsStore', (_, name) => settingsStore.get(name))
  settingsStore.on('change', (name, val) =>
    window.sendAll('changeSettingsStore', name, val)
  )

  ipcMain.handle('readClipboardImage', () => {
    const image = clipboard.readImage()
    if (!image.isEmpty()) {
      return convertBin(image.toPNG(), 'base64')
    }
  })

  ipcMain.handle('getWebUIPort', () => webui.getPort())
  ipcMain.handle('isWebUIRunning', () => webui.isRunning())
  ipcMain.handle('relaunch', () => {
    webui.quit()
    app.relaunch()
    app.exit()
  })
}
