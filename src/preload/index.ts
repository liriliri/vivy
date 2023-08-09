import types from 'licia/types'
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('main', {
  getWebuiPort: () => ipcRenderer.invoke('getWebuiPort'),
  showTerminal: () => ipcRenderer.invoke('showTerminal'),
  getLogs: () => ipcRenderer.invoke('getLogs'),
  getMainStore: (name) => ipcRenderer.invoke('getMainStore', name),
  setMainStore: (name, val) => ipcRenderer.invoke('setMainStore', name, val),
})

contextBridge.exposeInMainWorld('preload', {
  ipcOnEvent: (event: string, cb: types.AnyFn) => {
    ipcRenderer.on(event, cb)
  },
})
