import { BrowserWindow, DownloadItem, session } from 'electron'
import * as window from 'share/main/lib/window'
import path from 'path'
import { ModelType } from 'common/types'
import * as model from '../lib/model'
import uuid from 'licia/uuid'
import map from 'licia/map'
import clone from 'licia/clone'
import now from 'licia/now'
import some from 'licia/some'
import fs from 'fs-extra'
import remove from 'licia/remove'
import Readiness from 'licia/Readiness'
import { handleEvent } from 'share/main/lib/util'

let win: BrowserWindow | null = null

let isIpcInit = false

export function showWin() {
  if (win) {
    win.focus()
    return
  }

  if (!isIpcInit) {
    isIpcInit = true
    initIpc()
  }

  win = window.create({
    name: 'download',
    minWidth: 640,
    minHeight: 480,
    width: 640,
    height: 480,
  })
  win.on('close', () => {
    win?.destroy()
    win = null
  })

  window.loadPage(win, { page: 'download' })
}

let downloadModelOptions: IDownloadModelOptions | null = null

interface IDownloadModelOptions {
  id: string
  url: string
  fileName: string
  path?: string
  type: ModelType
}

const readiness = new Readiness()
export async function downloadModel(options: IDownloadModelOptions) {
  const mainWin = window.getWin('main')
  if (!mainWin) {
    return
  }

  if (some(downloads, (download) => download.url === options.url)) {
    return
  }

  if (downloadModelOptions) {
    await readiness.ready(downloadModelOptions.id)
  }

  downloadModelOptions = options
  let p = path.join(model.getDir(options.type), options.fileName)
  downloadModelOptions.path = p
  if (fs.existsSync(p)) {
    await fs.unlink(p)
  }
  p += '.vivydownload'
  if (fs.existsSync(p)) {
    await fs.unlink(p)
  }
  mainWin.webContents.downloadURL(options.url)

  return readiness.ready(options.id)
}

interface IDownload {
  id: string
  url: string
  fileName: string
  state: string
  speed: number
  totalBytes: number
  receivedBytes: number
  downloadItem: DownloadItem
  paused: boolean
  path: string
  type: ModelType
}

const downloads: IDownload[] = []

export function init() {
  session.defaultSession.on('will-download', function (_, item) {
    if (!downloadModelOptions) {
      return
    }
    readiness.signal(downloadModelOptions.id)

    const p = downloadModelOptions.path || ''

    item.setSavePath(p + '.vivydownload')

    let prevReceivedBytes = 0
    let prevTime = now()
    item.on('updated', (e, state) => {
      download.totalBytes = item.getTotalBytes()
      download.receivedBytes = item.getReceivedBytes()
      download.state = state
      download.paused = item.isPaused()
      const time = now()
      if (time - prevTime >= 1000) {
        download.speed = Math.round(
          ((download.receivedBytes - prevReceivedBytes) / (time - prevTime)) *
            1000
        )
        prevTime = time
        prevReceivedBytes = download.receivedBytes
      }
      if (win) {
        win.webContents.send('updateDownload', cloneDownload(download))
      }
    })

    item.on('done', async (e, state) => {
      download.state = state
      download.receivedBytes = item.getReceivedBytes()
      if (win) {
        win.webContents.send('updateDownload', cloneDownload(download))
      }
      if (download.state === 'completed') {
        const savePath = p + '.vivydownload'
        await fs.rename(savePath, savePath.replace('.vivydownload', ''))
      }
    })

    const download: IDownload = {
      id: uuid(),
      url: downloadModelOptions.url,
      fileName: downloadModelOptions.fileName,
      state: item.getState(),
      speed: 0,
      totalBytes: item.getTotalBytes(),
      receivedBytes: item.getReceivedBytes(),
      downloadItem: item,
      paused: item.isPaused(),
      path: p,
      type: downloadModelOptions.type,
    }
    downloads.push(download)
    if (win) {
      win.webContents.send('addDownload', cloneDownload(download))
    }

    downloadModelOptions = null
  })
}

function getDownload(id: string): IDownload | undefined {
  for (let i = 0, len = downloads.length; i < len; i++) {
    if (downloads[i].id === id) {
      return downloads[i]
    }
  }
}

function initIpc() {
  handleEvent('getDownloads', () =>
    map(downloads, (download) => cloneDownload(download))
  )
  handleEvent('pauseDownload', (id) => {
    const download = getDownload(id)
    if (download) {
      download.downloadItem.pause()
    }
  })
  handleEvent('resumeDownload', (id) => {
    const download = getDownload(id)
    if (download) {
      download.downloadItem.resume()
    }
  })
  handleEvent('deleteDownload', (id) => {
    const download = getDownload(id)
    if (download) {
      if (download.state !== 'completed') {
        download.downloadItem.cancel()
      }
      remove(downloads, (download) => download.id === id)
      if (win) {
        win.webContents.send('deleteDownload', id)
      }
    }
  })
}

function cloneDownload(download: IDownload) {
  const ret: any = clone(download)
  delete ret.downloadItem

  return ret
}
