import types from 'licia/types'
import {
  OpenDialogOptions,
  contextBridge,
  ipcRenderer,
  SaveDialogOptions,
} from 'electron'
import { Titlebar, TitlebarColor } from 'custom-electron-titlebar'
import { colorBgContainer, colorBgContainerDark } from '../common/theme'
import { ModelType } from '../common/types'
import getUrlParam from 'licia/getUrlParam'
import detectOs from 'licia/detectOs'
import fs from 'fs'

let titleBar: Titlebar

window.addEventListener('DOMContentLoaded', async () => {
  titleBar = new Titlebar({
    containerOverflow: 'hidden',
  })
  if (getUrlParam('page') && detectOs() !== 'os x') {
    document.body.classList.add('hide-cet-menubar')
  }
  updateTheme()
})

async function updateTheme() {
  const theme = await mainObj.getTheme()
  if (theme === 'dark') {
    document.body.classList.add('-theme-with-dark-background')
  } else {
    document.body.classList.remove('-theme-with-dark-background')
  }
  const backgroundColor = TitlebarColor.fromHex(
    theme === 'dark' ? colorBgContainerDark : colorBgContainer
  )
  ;(titleBar as any).currentOptions.menuBarBackgroundColor = backgroundColor
  titleBar.updateBackground(backgroundColor)
}

const mainObj = {
  getWebUIPort: () => ipcRenderer.invoke('getWebUIPort'),
  isWebUIRunning: () => ipcRenderer.invoke('isWebUIRunning'),
  showTerminal: () => ipcRenderer.invoke('showTerminal'),
  showDownload: () => ipcRenderer.invoke('showDownload'),
  getDownloads: () => ipcRenderer.invoke('getDownloads'),
  pauseDownload: (id: string) => ipcRenderer.invoke('pauseDownload', id),
  resumeDownload: (id: string) => ipcRenderer.invoke('resumeDownload', id),
  deleteDownload: (id: string) => ipcRenderer.invoke('deleteDownload', id),
  downloadModel: (options: {
    url: string
    fileName: string
    type: ModelType
  }) => ipcRenderer.invoke('downloadModel', options),
  isModelExists: (type: ModelType, name: string) => {
    return ipcRenderer.invoke('isModelExists', type, name)
  },
  showModel: () => ipcRenderer.invoke('showModel'),
  showPrompt: () => ipcRenderer.invoke('showPrompt'),
  showPainter: (mode: 'sketch' | 'mask') =>
    ipcRenderer.invoke('showPainter', mode),
  closePainter: () => ipcRenderer.invoke('closePainter'),
  showSystem: () => ipcRenderer.invoke('showSystem'),
  getLogs: () => ipcRenderer.invoke('getLogs'),
  getMainStore: (name) => ipcRenderer.invoke('getMainStore', name),
  setMainStore: (name, val) => ipcRenderer.invoke('setMainStore', name, val),
  getMemStore: (name) => ipcRenderer.invoke('getMemStore', name),
  setMemStore: (name, val) => ipcRenderer.invoke('setMemStore', name, val),
  getModelStore: (name) => ipcRenderer.invoke('getModelStore', name),
  setModelStore: (name, val) => ipcRenderer.invoke('setModelStore', name, val),
  getSettingsStore: (name) => ipcRenderer.invoke('getSettingsStore', name),
  setSettingsStore: (name, val) => {
    return ipcRenderer.invoke('setSettingsStore', name, val)
  },
  getLanguage: () => ipcRenderer.invoke('getLanguage'),
  getTheme: () => ipcRenderer.invoke('getTheme'),
  readClipboardImage: () => ipcRenderer.invoke('readClipboardImage'),
  showOpenDialog: (options: OpenDialogOptions = {}) => {
    return ipcRenderer.invoke('showOpenDialog', options)
  },
  showSaveDialog: (options: SaveDialogOptions = {}) => {
    return ipcRenderer.invoke('showSaveDialog', options)
  },
  getCpuAndMem: () => ipcRenderer.invoke('getCpuAndMem'),
  translate: (text) => ipcRenderer.invoke('translate', text),
  relaunch: () => ipcRenderer.invoke('relaunch'),
  getModels: (type: ModelType) => ipcRenderer.invoke('getModels', type),
  openModelDir: (type: ModelType) => ipcRenderer.invoke('openModelDir', type),
  deleteModel: (type: ModelType, name: string) => {
    return ipcRenderer.invoke('deleteModel', type, name)
  },
  addModel: (type: ModelType, filePath: string) => {
    return ipcRenderer.invoke('addModel', type, filePath)
  },
  setModelPreview: (
    type: ModelType,
    name: string,
    data: string,
    mimeType: string
  ) => {
    return ipcRenderer.invoke('setModelPreview', type, name, data, mimeType)
  },
  openFile: (path: string) => ipcRenderer.invoke('openFile', path),
  openFileInFolder: (path: string) =>
    ipcRenderer.invoke('openFileInFolder', path),
  quitApp: () => ipcRenderer.invoke('quitApp'),
  showContextMenu: (x: number, y: number, template: any) => {
    ipcRenderer.invoke(
      'showContextMenu',
      Math.round(x),
      Math.round(y),
      template
    )
  },
  on: (event: string, cb: types.AnyFn) => ipcRenderer.on(event, cb),
  off: (event: string, cb: types.AnyFn) => ipcRenderer.off(event, cb),
}
contextBridge.exposeInMainWorld('main', mainObj)

mainObj.on('updateTheme', updateTheme)

const preloadObj = {
  setTitle: (title: string) => {
    document.title = title
    if (titleBar) {
      titleBar.updateTitle(title)
    }
  },
}
contextBridge.exposeInMainWorld('preload', preloadObj)

const nodeObj = {
  writeFile: fs.promises.writeFile,
  readFile: fs.promises.readFile,
  existsSync: fs.existsSync,
}
contextBridge.exposeInMainWorld('node', nodeObj)

declare global {
  const main: typeof mainObj
  const preload: typeof preloadObj
  const node: typeof nodeObj
  const VIVY_VERSION: string
}
