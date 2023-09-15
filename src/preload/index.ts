import types from 'licia/types'
import isDarkMode from 'licia/isDarkMode'
import { OpenDialogOptions, contextBridge, ipcRenderer } from 'electron'
import { Titlebar, TitlebarColor } from 'custom-electron-titlebar'
import { colorBgContainer, colorBgContainerDark } from '../common/theme'

let titleBar: Titlebar

window.addEventListener('DOMContentLoaded', async () => {
  titleBar = new Titlebar({
    containerOverflow: 'hidden',
  })
  setTheme(await mainObj.getSettingsStore('theme'))
})

function setTheme(theme?: string) {
  if (!theme) {
    theme = isDarkMode() ? 'dark' : 'light'
  }
  if (theme === 'dark') {
    document.body.classList.add('-theme-with-dark-background')
  } else {
    document.body.classList.remove('-theme-with-dark-background')
  }
  titleBar.updateBackground(
    TitlebarColor.fromHex(
      theme === 'dark' ? colorBgContainerDark : colorBgContainer
    )
  )
}

const mainObj = {
  getWebuiPort: () => ipcRenderer.invoke('getWebuiPort'),
  showTerminal: () => ipcRenderer.invoke('showTerminal'),
  showModel: () => ipcRenderer.invoke('showModel'),
  showPrompt: () => ipcRenderer.invoke('showPrompt'),
  showSystem: () => ipcRenderer.invoke('showSystem'),
  getLogs: () => ipcRenderer.invoke('getLogs'),
  getMainStore: (name) => ipcRenderer.invoke('getMainStore', name),
  setMainStore: (name, val) => ipcRenderer.invoke('setMainStore', name, val),
  getSettingsStore: (name) => ipcRenderer.invoke('getSettingsStore', name),
  setSettingsStore: (name, val) =>
    ipcRenderer.invoke('setSettingsStore', name, val),
  showOpenDialog: (options: OpenDialogOptions = {}) =>
    ipcRenderer.invoke('showOpenDialog', options),
  getCpuAndMem: () => ipcRenderer.invoke('getCpuAndMem'),
  translate: (text) => ipcRenderer.invoke('translate', text),
  relaunch: () => ipcRenderer.invoke('relaunch'),
  on: (event: string, cb: types.AnyFn) => ipcRenderer.on(event, cb),
}
contextBridge.exposeInMainWorld('main', mainObj)

mainObj.on('changeSettingsStore', (_, name, val) => {
  if (name === 'theme') {
    setTheme(val)
  }
})

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
  const main: typeof mainObj
  const preload: typeof preloadObj
}
