import types from 'licia/types'
import isDarkMode from 'licia/isDarkMode'
import { contextBridge, ipcRenderer } from 'electron'
import { Titlebar, TitlebarColor } from 'custom-electron-titlebar'

window.addEventListener('DOMContentLoaded', () => {
  new Titlebar({
    containerOverflow: 'hidden',
    backgroundColor: TitlebarColor.fromHex(
      isDarkMode() ? '#141414' : '#ffffff'
    ),
  })
})

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
