import path from 'path'
import { BrowserWindow, app, clipboard, shell } from 'electron'
import { getMainStore, getSettingsStore } from '../lib/store'
import { bing, google, Language } from '../lib/translator'
import * as window from 'share/main/lib/window'
import * as webui from './webui'
import * as model from '../lib/model'
import convertBin from 'licia/convertBin'
import os from 'os'
import fs from 'fs-extra'
import isMac from 'licia/isMac'
import endWith from 'licia/endWith'
import { handleEvent } from 'share/main/lib/util'

const store = getMainStore()
const settingsStore = getSettingsStore()

let win: BrowserWindow | null = null

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
    name: 'main',
    minWidth: 1280,
    minHeight: 850,
    width: 1280,
    height: 850,
    menu: true,
  })
  win.on('close', (e) => {
    if (!quitApp) {
      e.preventDefault()
      win?.webContents.send('closeMain')
    }
  })

  window.loadPage(win)
}

let openProjectPath = ''
if (isMac) {
  app.on('open-file', (_, path) => {
    if (!endWith(path, '.vivy')) {
      return
    }
    openProjectPath = path
    if (app.isReady()) {
      window.sendTo('main', 'openProject', path)
    }
  })
}

function initIpc() {
  handleEvent('quitApp', () => {
    quitApp = true
    app.quit()
  })
  handleEvent('setMainStore', (name, val) => store.set(name, val))
  handleEvent('getMainStore', (name) => store.get(name))
  handleEvent('isModelExists', (type, name) => model.exists(type, name))
  store.on('change', (name, val) => {
    window.sendAll('changeMainStore', name, val)
  })
  handleEvent('translate', async (text) => {
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

  handleEvent('setSettingsStore', (name, val) => {
    settingsStore.set(name, val)
  })
  handleEvent('getSettingsStore', (name) => settingsStore.get(name))
  settingsStore.on('change', (name, val) =>
    window.sendAll('changeSettingsStore', name, val)
  )

  handleEvent('readClipboardImage', () => {
    const image = clipboard.readImage()
    if (!image.isEmpty()) {
      return convertBin(image.toPNG(), 'base64')
    }
  })

  handleEvent('openImage', async (data: string, name: string) => {
    const p = path.join(os.tmpdir(), name)
    await fs.writeFile(p, Buffer.from(data, 'base64'))
    shell.openPath(p)
  })

  handleEvent('getDevices', () => webui.getDevices())

  function getOpenProjectPathFromArgv(argv: string[]) {
    for (let i = 0, len = argv.length; i < len; i++) {
      const arg = argv[i]
      if (endWith(arg, '.vivy')) {
        return arg
      }
    }

    return ''
  }

  handleEvent('getOpenProjectPath', () => {
    if (isMac) {
      return openProjectPath
    }

    return getOpenProjectPathFromArgv(process.argv)
  })

  app.on('second-instance', (_, argv) => {
    const path = getOpenProjectPathFromArgv(argv)
    if (path) {
      window.sendTo('main', 'openProject', path)
    }
  })
}
