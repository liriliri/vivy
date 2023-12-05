import path from 'path'
import { isDev, sendAll } from '../lib/util'
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
import { getDir as getModelDir } from '../lib/model'
import { ModelType } from '../../common/types'
import * as prompt from './prompt'
import * as system from './system'
import * as download from './download'
import each from 'licia/each'
import { getMainStore, getSettingsStore } from '../lib/store'
import { bing, google, Language } from '../lib/translator'
import createWin from './createWin'
import isBuffer from 'licia/isBuffer'
import { i18n } from '../lib/util'
import chokidar from 'chokidar'
import debounce from 'licia/debounce'
import startWith from 'licia/startWith'
import isWindows from 'licia/isWindows'
import contain from 'licia/contain'

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

  win = createWin({
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
  ipcMain.handle('getLogs', () => logs)
  ipcMain.handle('getWebuiPort', () => webui.getPort())
  ipcMain.handle('showTerminal', () => terminal.showWin())
  ipcMain.handle('showDownload', () => download.showWin())
  ipcMain.handle('downloadModel', (_, options) => downloadModel(options))
  ipcMain.handle('showModel', () => model.showWin())
  ipcMain.handle('showPrompt', () => prompt.showWin())
  ipcMain.handle('showSystem', () => system.showWin())
  ipcMain.handle('setMainStore', (_, name, val) => store.set(name, val))
  ipcMain.handle('getMainStore', (_, name) => store.get(name))
  store.on('change', (name, val) => sendAll('changeMainStore', name, val))
  ipcMain.handle('relaunch', () => {
    webui.quit()
    app.relaunch()
    app.exit()
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
    if (name === 'theme') {
      nativeTheme.themeSource = val
    }
    settingsStore.set(name, val)
  })
  ipcMain.handle('getSettingsStore', (_, name) => settingsStore.get(name))
  settingsStore.on('change', (name, val) =>
    sendAll('changeSettingsStore', name, val)
  )

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

  const language = settingsStore.get('language')
  if (language) {
    i18n.locale(language)
  }
  const theme = settingsStore.get('theme')
  if (theme) {
    nativeTheme.themeSource = theme
  }

  chokidar.watch(settingsStore.get('modelPath')).on(
    'all',
    debounce((event, path) => {
      let type: ModelType | null = null
      if (startWith(path, getModelDir(ModelType.StableDiffusion))) {
        type = ModelType.StableDiffusion
      } else if (startWith(path, getModelDir(ModelType.Lora))) {
        type = ModelType.Lora
      } else if (startWith(path, getModelDir(ModelType.Embedding))) {
        type = ModelType.Embedding
      }
      if (type) {
        sendAll('refreshModel', type)
      }
    }, 1000)
  )
}

const logs: string[] = []

export function init() {
  const stdoutWrite = process.stdout.write
  const stderrWrite = process.stderr.write

  process.stdout.write = function (...args) {
    addLog(args[0])

    return stdoutWrite.apply(process.stdout, args as any)
  }

  process.stderr.write = function (...args) {
    addLog(args[0])

    return stderrWrite.apply(process.stderr, args as any)
  }

  function addLog(data: string | Buffer) {
    if (isBuffer(data)) {
      data = data.toString('utf8')
    }
    if (isWindows && contain(data, '|')) {
      data = (data as string).replace(/\ufffd/g, '█')
    }
    logs.push(data as string)
    sendAll('addLog', data)
  }
}

interface IDownloadModelOptions {
  url: string
  fileName: string
  type: ModelType
}

export function downloadModel(options: IDownloadModelOptions) {
  if (!win) {
    return
  }
  win.webContents.downloadURL(options.url)
}
