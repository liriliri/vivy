import path from 'path'
import { isDev } from '../lib/util'
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
    win.loadURL('http://localhost:8080/?page=model')
  } else {
    win.loadFile(path.resolve(__dirname, '../renderer/index.html'), {
      query: {
        page: 'model',
      },
    })
  }
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
