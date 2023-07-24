import { app } from 'electron'
import * as webui from './lib/webui'
import * as logger from './lib/logger'
import * as menu from './lib/menu'
import * as main from './lib/main'

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

app.setName('Vivy')

app.on('ready', () => {
  logger.init()
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
