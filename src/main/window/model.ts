import { BrowserWindow } from 'electron'
import { getModelStore } from '../lib/store'
import * as window from 'share/main/lib/window'
import { ModelType } from 'common/types'
import * as model from '../lib/model'
import { handleEvent } from 'share/main/lib/util'

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
    width: 960,
    height: 640,
  })
  win.on('close', () => {
    win?.destroy()
    win = null
  })

  window.loadPage(win, { page: 'model' })
}

function initIpc() {
  handleEvent('setModelStore', (name, val) => store.set(name, val))
  handleEvent('getModelStore', (name) => store.get(name))
  handleEvent('getModels', (type: ModelType) => model.getModels(type))
  handleEvent('openModelDir', (type: ModelType) => model.openDir(type))
  handleEvent('deleteModel', (type: ModelType, name: string) => {
    return model.deleteModel(type, name)
  })
  handleEvent('addModel', (type: ModelType, filePath: string) => {
    return model.addModel(type, filePath)
  })
  handleEvent(
    'setModelPreview',
    (type: ModelType, name: string, data: string, mimeType: string) => {
      return model.setModelPreview(type, name, data, mimeType)
    }
  )
}
