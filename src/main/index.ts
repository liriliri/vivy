import { app } from 'electron'
import * as webui from './lib/webui'
import * as menu from './lib/menu'
import * as ipc from './lib/ipc'
import * as main from './lib/main'

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

app.setName('Vivy')

app.on('ready', () => {
  webui.start()
  ipc.init()
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
