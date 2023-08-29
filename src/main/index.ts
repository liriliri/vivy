import { app, ipcMain, nativeTheme } from 'electron'
import * as webui from './window/webui'
import * as terminal from './window/terminal'
import * as menu from './lib/menu'
import * as main from './window/main'
import { setupTitlebar } from 'custom-electron-titlebar/main'
import { getSettingsStore } from './lib/store'
import { i18n } from './lib/util'

const store = getSettingsStore()

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

app.setName('Vivy')

app.on('ready', () => {
  ipcMain.handle('setSettingsStore', (_, name, val) => store.set(name, val))
  ipcMain.handle('getSettingsStore', (_, name) => store.get(name))
  const language = store.get('language')
  if (language) {
    i18n.locale(language)
  }
  const theme = store.get('theme')
  if (theme) {
    nativeTheme.themeSource = theme
  }

  setupTitlebar()
  terminal.init()
  webui.start()
  main.showWin()
  menu.init()
})

app.on('second-instance', () => {
  const win = main.getWin()
  if (win) {
    if (win.isMaximized()) {
      win.restore()
    }
    win.focus()
  }
})
