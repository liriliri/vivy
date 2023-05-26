import { app } from 'electron'
import * as webui from './lib/webui'
import * as menu from './lib/menu'
import * as ipc from './lib/ipc'
import * as mainWin from './lib/mainWin'

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

app.setName('Vivy')

app.on('ready', () => {
  webui.start()
  ipc.init()
  mainWin.create()
  menu.init()
})

app.on('second-instance', () => {
  const win = mainWin.getWin()
  if (win) {
    if (win.isMaximized()) {
      win.restore()
    }
    win.focus()
  }
})
