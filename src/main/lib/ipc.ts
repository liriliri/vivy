import * as download from '../window/download'
import * as webui from '../window/webui'
import * as model from '../window/model'
import * as prompt from '../window/prompt'
import * as painter from '../window/painter'
import uuid from 'licia/uuid'
import * as ipc from 'share/main/lib/ipc'
import { handleEvent } from 'share/main/lib/util'

export function init() {
  ipc.init()

  handleEvent('showPrompt', () => prompt.showWin())
  handleEvent('showPainter', (mode: 'sketch' | 'mask') => painter.showWin(mode))
  handleEvent('showWebUI', () => webui.showWin())
  handleEvent('closePainter', () => painter.closeWin())
  handleEvent('showDownload', () => download.showWin())
  handleEvent('showModel', () => model.showWin())
  handleEvent('downloadModel', (options) =>
    download.downloadModel({
      id: uuid(),
      ...options,
    })
  )

  handleEvent('getWebUIPort', () => webui.getPort())
  handleEvent('isWebUIRunning', () => webui.isRunning())
}
