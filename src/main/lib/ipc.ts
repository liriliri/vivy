import { app, ipcMain, shell } from 'electron'
import * as download from '../window/download'
import * as webui from '../window/webui'
import * as terminal from '../window/terminal'
import * as model from '../window/model'
import * as prompt from '../window/prompt'
import * as system from '../window/system'
import * as painter from '../window/painter'
import each from 'licia/each'
import uuid from 'licia/uuid'
import * as ipc from 'share/main/lib/ipc'

export function init() {
  ipc.init()

  ipcMain.handle('showSystem', () => system.showWin())
  ipcMain.handle('showPrompt', () => prompt.showWin())
  ipcMain.handle('showPainter', (_, mode: 'sketch' | 'mask') =>
    painter.showWin(mode)
  )
  ipcMain.handle('showWebUI', () => webui.showWin())
  ipcMain.handle('closePainter', () => painter.closeWin())
  ipcMain.handle('showTerminal', () => terminal.showWin())
  ipcMain.handle('showDownload', () => download.showWin())
  ipcMain.handle('showModel', () => model.showWin())
  ipcMain.handle('downloadModel', (_, options) =>
    download.downloadModel({
      id: uuid(),
      ...options,
    })
  )
  let cpuAndRamCache: any = null
  ipcMain.handle('getCpuAndRam', async () => {
    if (cpuAndRamCache) {
      return cpuAndRamCache
    }

    const metrics = app.getAppMetrics()
    let cpu = 0
    let ram = 0
    each(metrics, (metric) => {
      cpu += metric.cpu.percentCPUUsage
      ram += metric.memory.workingSetSize * 1024
    })

    const webuiCpuAndRam = await webui.getCpuAndRam()
    cpu += webuiCpuAndRam.cpu
    ram += webuiCpuAndRam.ram

    cpuAndRamCache = {
      cpu,
      ram,
    }

    setTimeout(() => (cpuAndRamCache = null), 2000)

    return cpuAndRamCache
  })
  ipcMain.handle('openFile', (_, path: string) => {
    shell.openPath(path)
  })
  ipcMain.handle('openFileInFolder', (_, path: string) => {
    shell.showItemInFolder(path)
  })

  ipcMain.handle('getWebUIPort', () => webui.getPort())
  ipcMain.handle('isWebUIRunning', () => webui.isRunning())
}
