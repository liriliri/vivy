import { contextBridge, ipcRenderer } from 'electron'
import { StableDiffusionApi } from 'stable-diffusion-api'

contextBridge.exposeInMainWorld('main', {
  getEasyDiffusionPort: () => ipcRenderer.invoke('getEasyDiffusionPort'),
  getWebuiPort: () => ipcRenderer.invoke('getWebuiPort'),
})

const webuiApi = new StableDiffusionApi()

contextBridge.exposeInMainWorld('node', {
  getWebuiApi: () => webuiApi,
})
