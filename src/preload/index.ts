import types from 'licia/types'
import isDarkMode from 'licia/isDarkMode'
import { contextBridge, ipcRenderer } from 'electron'
import { Titlebar, TitlebarColor } from 'custom-electron-titlebar'

let titleBar: Titlebar

window.addEventListener('DOMContentLoaded', () => {
  titleBar = new Titlebar({
    containerOverflow: 'hidden',
    backgroundColor: TitlebarColor.fromHex(
      isDarkMode() ? '#141414' : '#ffffff'
    ),
  })
})

const mainObj = {
  getWebuiPort: () => ipcRenderer.invoke('getWebuiPort'),
  showTerminal: () => ipcRenderer.invoke('showTerminal'),
  showModel: () => ipcRenderer.invoke('showModel'),
  getLogs: () => ipcRenderer.invoke('getLogs'),
  getMainStore: (name) => ipcRenderer.invoke('getMainStore', name),
  setMainStore: (name, val) => ipcRenderer.invoke('setMainStore', name, val),
  getSettingsStore: (name) => ipcRenderer.invoke('getSettingsStore', name),
  setSettingsStore: (name, val) => {
    return ipcRenderer.invoke('setSettingsStore', name, val)
  },
  on: (event: string, cb: types.AnyFn) => ipcRenderer.on(event, cb),
}
contextBridge.exposeInMainWorld('main', mainObj)

const preloadObj = {
  setTitle: (title: string) => titleBar.updateTitle(title),
}
contextBridge.exposeInMainWorld('preload', preloadObj)

declare global {
  var main: typeof mainObj
  var preload: typeof preloadObj
}
