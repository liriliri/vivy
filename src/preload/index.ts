import types from 'licia/types'
import isDarkMode from 'licia/isDarkMode'
import { contextBridge, ipcRenderer } from 'electron'
import { Titlebar, TitlebarColor } from 'custom-electron-titlebar'

let titleBar: Titlebar

window.addEventListener('DOMContentLoaded', async () => {
  let theme = await mainObj.getSettingsStore('theme')
  if (!theme) {
    theme = isDarkMode() ? 'dark' : 'light'
  }
  if (theme === 'dark') {
    document.body.classList.add('-theme-with-dark-background')
  }
  titleBar = new Titlebar({
    containerOverflow: 'hidden',
    backgroundColor: TitlebarColor.fromHex(
      theme === 'dark' ? '#141414' : '#ffffff'
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
  relaunch: () => ipcRenderer.invoke('relaunch'),
  on: (event: string, cb: types.AnyFn) => ipcRenderer.on(event, cb),
}
contextBridge.exposeInMainWorld('main', mainObj)

const preloadObj = {
  setTitle: (title: string) => {
    document.title = title
    if (titleBar) {
      titleBar.updateTitle(title)
    }
  },
}
contextBridge.exposeInMainWorld('preload', preloadObj)

declare global {
  var main: typeof mainObj
  var preload: typeof preloadObj
}
