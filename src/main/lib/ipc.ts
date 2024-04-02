import {
  app,
  ipcMain,
  shell,
  dialog,
  OpenDialogOptions,
  SaveDialogOptions,
} from 'electron'
import * as download from '../window/download'
import * as webui from '../window/webui'
import * as terminal from '../window/terminal'
import * as model from '../window/model'
import * as prompt from '../window/prompt'
import * as system from '../window/system'
import * as painter from '../window/painter'
import * as window from './window'
import contextMenu from './contextMenu'
import each from 'licia/each'
import { getMemStore } from './store'

const memStore = getMemStore()

export function init() {
  ipcMain.handle('showSystem', () => system.showWin())
  ipcMain.handle('showPrompt', () => prompt.showWin())
  ipcMain.handle('showPainter', (_, mode: 'sketch' | 'mask') =>
    painter.showWin(mode)
  )
  ipcMain.handle('closePainter', () => painter.closeWin())
  ipcMain.handle('showTerminal', () => terminal.showWin())
  ipcMain.handle('showDownload', () => download.showWin())
  ipcMain.handle('showModel', () => model.showWin())
  ipcMain.handle('downloadModel', (_, options) =>
    download.downloadModel(options)
  )
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
  ipcMain.handle('showOpenDialog', (_, options: OpenDialogOptions = {}) =>
    dialog.showOpenDialog(options)
  )
  ipcMain.handle('showSaveDialog', (_, options: SaveDialogOptions = {}) =>
    dialog.showSaveDialog(options)
  )

  ipcMain.handle('setMemStore', (_, name, val) => memStore.set(name, val))
  ipcMain.handle('getMemStore', (_, name) => memStore.get(name))
  memStore.on('change', (name, val) => {
    window.sendAll('changeMemStore', name, val)
  })
}
