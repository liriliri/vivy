import { app } from 'electron'
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
import { handleEvent } from 'share/main/lib/util'

export function init() {
  ipc.init()

  handleEvent('showSystem', () => system.showWin())
  handleEvent('showPrompt', () => prompt.showWin())
  handleEvent('showPainter', (mode: 'sketch' | 'mask') => painter.showWin(mode))
  handleEvent('showWebUI', () => webui.showWin())
  handleEvent('closePainter', () => painter.closeWin())
  handleEvent('showTerminal', () => terminal.showWin())
  handleEvent('showDownload', () => download.showWin())
  handleEvent('showModel', () => model.showWin())
  handleEvent('downloadModel', (options) =>
    download.downloadModel({
      id: uuid(),
      ...options,
    })
  )
  let cpuAndRamCache: any = null
  handleEvent('getCpuAndRam', async () => {
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

  handleEvent('getWebUIPort', () => webui.getPort())
  handleEvent('isWebUIRunning', () => webui.isRunning())
}
