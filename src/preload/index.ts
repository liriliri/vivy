import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('main', {
  getWebuiPort: () => ipcRenderer.invoke('getWebuiPort'),
})
