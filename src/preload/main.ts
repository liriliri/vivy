import { ipcRenderer, OpenDialogOptions, SaveDialogOptions } from 'electron'
import { ModelType } from '../common/types'
import types from 'licia/types'

export default {
  getWebUIPort: () => ipcRenderer.invoke('getWebUIPort'),
  isWebUIRunning: () => ipcRenderer.invoke('isWebUIRunning'),
  getDevices: () => ipcRenderer.invoke('getDevices'),
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
  clearLogs: () => ipcRenderer.invoke('clearLogs'),
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
  getCpuAndRam: () => ipcRenderer.invoke('getCpuAndRam'),
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
  updateMenu: () => ipcRenderer.invoke('updateMenu'),
  getOpenProjectPath: () => ipcRenderer.invoke('getOpenProjectPath'),
  openImage: (data: string, name: string) => {
    ipcRenderer.invoke('openImage', data, name)
  },
  sendToWindow: (name: string, channel: string, ...args: any[]) => {
    ipcRenderer.invoke('sendToWindow', name, channel, ...args)
  },
  on: (event: string, cb: types.AnyFn) => ipcRenderer.on(event, cb),
  off: (event: string, cb: types.AnyFn) => ipcRenderer.off(event, cb),
}
