import { ipcRenderer } from 'electron'
import { ModelType } from 'common/types'
import extend from 'licia/extend'
import mainObj from 'share/preload/main'

export default extend(mainObj, {
  getWebUIPort: () => ipcRenderer.invoke('getWebUIPort'),
  isWebUIRunning: () => ipcRenderer.invoke('isWebUIRunning'),
  getDevices: () => ipcRenderer.invoke('getDevices'),
  showDownload: () => ipcRenderer.invoke('showDownload'),
  getDownloads: () => ipcRenderer.invoke('getDownloads'),
  showWebUI: () => ipcRenderer.invoke('showWebUI'),
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
  getLogs: () => ipcRenderer.invoke('getLogs'),
  clearLogs: () => ipcRenderer.invoke('clearLogs'),
  getMainStore: (name) => ipcRenderer.invoke('getMainStore', name),
  setMainStore: (name, val) => ipcRenderer.invoke('setMainStore', name, val),
  getModelStore: (name) => ipcRenderer.invoke('getModelStore', name),
  setModelStore: (name, val) => ipcRenderer.invoke('setModelStore', name, val),
  getSettingsStore: (name) => ipcRenderer.invoke('getSettingsStore', name),
  setSettingsStore: (name, val) => {
    return ipcRenderer.invoke('setSettingsStore', name, val)
  },
  readClipboardImage: () => ipcRenderer.invoke('readClipboardImage'),
  translate: (text) => ipcRenderer.invoke('translate', text),
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
  quitApp: () => ipcRenderer.invoke('quitApp'),
  updateMenu: () => ipcRenderer.invoke('updateMenu'),
  getOpenProjectPath: () => ipcRenderer.invoke('getOpenProjectPath'),
  openImage: (data: string, name: string) => {
    ipcRenderer.invoke('openImage', data, name)
  },
})
