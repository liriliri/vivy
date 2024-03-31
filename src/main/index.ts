import { app } from 'electron'
import * as webui from './window/webui'
import * as menu from './lib/menu'
import * as ipc from './lib/ipc'
import * as model from './lib/model'
import * as main from './window/main'
import * as language from './lib/language'
import * as terminal from './window/terminal'
import * as download from './window/download'
import { setupTitlebar } from 'custom-electron-titlebar/main'

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

app.setName('Vivy')

app.on('ready', () => {
  setupTitlebar()
  language.init()
  terminal.init()
  download.init()
  webui.start()
  main.showWin()
  menu.init()
  ipc.init()
  model.init()
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
