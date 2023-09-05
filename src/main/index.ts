import { app, ipcMain, nativeTheme, dialog, OpenDialogOptions } from 'electron'
import * as webui from './window/webui'
import * as terminal from './window/terminal'
import * as menu from './lib/menu'
import * as main from './window/main'
import each from 'licia/each'
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
  ipcMain.handle('setSettingsStore', (_, name, val) => {
    if (name === 'theme') {
      nativeTheme.themeSource = val
    }
    store.set(name, val)
  })
  ipcMain.handle('getSettingsStore', (_, name) => store.get(name))

  ipcMain.handle('getCpuAndMem', async () => {
    const metrics = app.getAppMetrics()
    let cpu = 0
    let mem = 0
    each(metrics, (metric) => {
      cpu += metric.cpu.percentCPUUsage
      mem += metric.memory.workingSetSize * 1024
    })

    const webuiCpuAndMem = await webui.getCpuAndMem()
    cpu += webuiCpuAndMem.cpu
    mem += webuiCpuAndMem.mem

    return {
      cpu,
      mem,
    }
  })

  ipcMain.handle('showOpenDialog', (_, options: OpenDialogOptions = {}) =>
    dialog.showOpenDialog(options)
  )

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
