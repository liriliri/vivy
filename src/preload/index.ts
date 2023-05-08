import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('main', {
  getEasyDiffusionPort: () => ipcRenderer.invoke('getEasyDiffusionPort'),
})
