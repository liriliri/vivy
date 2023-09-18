import path from 'path'
import { isDev } from '../lib/util'
import {
  BrowserWindow,
  ipcMain,
  app,
  nativeTheme,
  OpenDialogOptions,
  dialog,
} from 'electron'
import * as webui from './webui'
import * as terminal from './terminal'
import * as model from './model'
import * as prompt from './prompt'
import * as system from './system'
import each from 'licia/each'
import { getMainStore, getSettingsStore } from '../lib/store'
import { bing, Language } from '../lib/translator'
import createWin from './createWin'
import { i18n } from '../lib/util'

const store = getMainStore()
const settingsStore = getSettingsStore()

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
  ipcMain.handle('showSystem', () => system.showWin())
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

  ipcMain.handle('setSettingsStore', (_, name, val) => {
    if (name === 'theme') {
      nativeTheme.themeSource = val
    }
    settingsStore.set(name, val)
  })
  ipcMain.handle('getSettingsStore', (_, name) => settingsStore.get(name))
  settingsStore.on('change', (name, val) => {
    each(BrowserWindow.getAllWindows(), (win) => {
      win.webContents.send('changeSettingsStore', name, val)
    })
  })

  ipcMain.handle('getCpuAndMem', async () => {
    const metrics = app.getAppMetrics()
    let cpu = 0
    let mem = 0
    each(metrics, (metric) => {
      cpu += metric.cpu.percentCPUUsage
      mem += metric.memory.workingSetSize * 1024
    })

    const webuiCpuAndMem = await webui.getCpuAndMem()
    cpu += webuiCpuAndMem.cpu
    mem += webuiCpuAndMem.mem

    return {
      cpu,
      mem,
    }
  })

  ipcMain.handle('showOpenDialog', (_, options: OpenDialogOptions = {}) =>
    dialog.showOpenDialog(options)
  )

  const language = store.get('language')
  if (language) {
    i18n.locale(language)
  }
  const theme = store.get('theme')
  if (theme) {
    nativeTheme.themeSource = theme
  }
}
