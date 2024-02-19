import { app, ipcMain, shell } from 'electron'
import * as download from '../window/download'
import * as webui from '../window/webui'
import * as terminal from '../window/terminal'
import * as model from '../window/model'
import * as prompt from '../window/prompt'
import * as system from '../window/system'
import * as painter from '../window/painter'
import contextMenu from './contextMenu'
import each from 'licia/each'

export function init() {
  ipcMain.handle('showSystem', () => system.showWin())
  ipcMain.handle('showPrompt', () => prompt.showWin())
  ipcMain.handle('showPainter', () => painter.showWin())
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
  ipcMain.handle('openFile', (_, path: string) => {
    shell.openPath(path)
  })
  ipcMain.handle('openFileInFolder', (_, path: string) => {
    shell.showItemInFolder(path)
  })
  ipcMain.handle(
    'showContextMenu',
    (_, x: number, y: number, template: any) => {
      contextMenu(x, y, template)
    }
  )
}
