import { app, ipcMain } from 'electron'
import * as webui from './lib/webui'
import * as terminal from './lib/terminal'
import * as menu from './lib/menu'
import * as main from './lib/main'
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
