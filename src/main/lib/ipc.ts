import { app, ipcMain } from 'electron'
import * as download from '../window/download'
import * as webui from '../window/webui'
import * as terminal from '../window/terminal'
import * as model from '../window/model'
import * as prompt from '../window/prompt'
import * as system from '../window/system'
import each from 'licia/each'

export function init() {
  ipcMain.handle('showSystem', () => system.showWin())
  ipcMain.handle('showPrompt', () => prompt.showWin())
  ipcMain.handle('showTerminal', () => terminal.showWin())
  ipcMain.handle('showDownload', () => download.showWin())
  ipcMain.handle('showModel', () => model.showWin())
  ipcMain.handle('downloadModel', (_, options) =>
    download.downloadModel(options)
  )
  ipcMain.handle('getWebuiPort', () => webui.getPort())
  ipcMain.handle('relaunch', () => {
    webui.quit()
    app.relaunch()
    app.exit()
  })
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
}
