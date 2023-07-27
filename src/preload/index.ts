import types from 'licia/types'
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('main', {
  getWebuiPort: () => ipcRenderer.invoke('getWebuiPort'),
  showLogger: () => ipcRenderer.invoke('showLogger'),
  getLogs: () => ipcRenderer.invoke('getLogs'),
})

contextBridge.exposeInMainWorld('preload', {
  ipcOnEvent: (event: string, cb: types.AnyFn) => {
    ipcRenderer.on(event, cb)
  },
})
