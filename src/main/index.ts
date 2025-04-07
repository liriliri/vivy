import { app } from 'electron'
import * as webui from './window/webui'
import * as menu from './lib/menu'
import * as window from 'share/main/lib/window'
import * as ipc from './lib/ipc'
import * as model from './lib/model'
import * as main from './window/main'
import * as language from 'share/main/lib/language'
import * as theme from 'share/main/lib/theme'
import * as proxy from './lib/proxy'
import * as terminal from './window/terminal'
import * as download from './window/download'
import * as updater from 'share/main/lib/updater'
import { setupTitlebar } from 'custom-electron-titlebar/main'

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

app.setName('Vivy')

app.on('ready', () => {
  setupTitlebar()
  language.init()
  theme.init()
  proxy.init()
  terminal.init()
  download.init()
  webui.start()
  main.showWin()
  menu.init()
  ipc.init()
  model.init()
  updater.init()
})

app.on('second-instance', () => {
  const win = window.getWin('main')
  if (win) {
    if (win.isMaximized()) {
      win.restore()
    }
    win.focus()
  }
})
