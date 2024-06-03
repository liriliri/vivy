import { BrowserWindow, ipcMain } from 'electron'
import { getModelStore } from '../lib/store'
import * as window from '../lib/window'
import { ModelType } from '../../common/types'
import * as model from '../lib/model'

const store = getModelStore()

let win: BrowserWindow | null = null

let isIpcInit = false

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
    name: 'model',
    minWidth: 960,
    minHeight: 640,
    ...store.get('bounds'),
    onSavePos: () => window.savePos(win, store),
  })
  win.on('close', () => {
    win?.destroy()
    win = null
  })

  window.loadPage(win, { page: 'model' })
}

function initIpc() {
  ipcMain.handle('setModelStore', (_, name, val) => store.set(name, val))
  ipcMain.handle('getModelStore', (_, name) => store.get(name))
  ipcMain.handle('getModels', (_, type: ModelType) => model.getModels(type))
  ipcMain.handle('openModelDir', (_, type: ModelType) => model.openDir(type))
  ipcMain.handle('deleteModel', (_, type: ModelType, name: string) => {
    return model.deleteModel(type, name)
  })
  ipcMain.handle('addModel', (_, type: ModelType, filePath: string) => {
    return model.addModel(type, filePath)
  })
  ipcMain.handle(
    'setModelPreview',
    (_, type: ModelType, name: string, data: string, mimeType: string) => {
      return model.setModelPreview(type, name, data, mimeType)
    }
  )
}
