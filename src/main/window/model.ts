import path from 'path'
import { isDev } from '../lib/util'
import { BrowserWindow, ipcMain } from 'electron'
import { getModelStore } from '../lib/store'
import createWin from './createWin'
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
  ipcMain.handle('getModels', (_, type: ModelType) => model.getModels(type))
  ipcMain.handle('openModelDir', (_, type: ModelType) => model.openDir(type))
}
