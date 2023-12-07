import { BrowserWindow, DownloadItem, ipcMain, session } from 'electron'
import createWin from './createWin'
import { isDev } from '../lib/util'
import path from 'path'
import { getDownloadStore } from '../lib/store'
import { ModelType } from '../../common/types'
import * as model from '../lib/model'
import * as main from './main'
import uuid from 'licia/uuid'
import map from 'licia/map'
import clone from 'licia/clone'
import now from 'licia/now'
import fs from 'fs-extra'

const store = getDownloadStore()

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

  win = createWin({
    minWidth: 640,
    minHeight: 480,
    ...store.get('bounds'),
    onSavePos: () => store.set('bounds', win?.getBounds()),
  })
  win.on('close', () => {
    win?.destroy()
    win = null
  })

  if (isDev()) {
    win.loadURL('http://localhost:8080/?page=download')
  } else {
    win.loadFile(path.resolve(__dirname, '../renderer/index.html'), {
      query: {
        page: 'download',
      },
    })
  }
}

let downloadModelOptions: IDownloadModelOptions | null = null

interface IDownloadModelOptions {
  url: string
  fileName: string
  type: ModelType
}

export async function downloadModel(options: IDownloadModelOptions) {
  const mainWin = main.getWin()
  if (!mainWin) {
    return
  }
  downloadModelOptions = options
  let savePath = path.join(model.getDir(options.type), options.fileName)
  if (fs.existsSync(savePath)) {
    await fs.unlink(savePath)
  }
  savePath += '.vivydownload'
  if (fs.existsSync(savePath)) {
    await fs.unlink(savePath)
  }
  mainWin.webContents.downloadURL(options.url)
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
}

const downloads: IDownload[] = []

export function init() {
  session.defaultSession.on('will-download', function (_, item) {
    if (!downloadModelOptions) {
      return
    }

    const { type, fileName } = downloadModelOptions
    const savePath = path.join(model.getDir(type), fileName) + '.vivydownload'
    item.setSavePath(savePath)

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
  ipcMain.handle('getDownloads', () =>
    map(downloads, (download) => cloneDownload(download))
  )
  ipcMain.handle('pauseDownload', (_, id) => {
    const download = getDownload(id)
    if (download) {
      download.downloadItem.pause()
    }
  })
  ipcMain.handle('resumeDownload', (_, id) => {
    const download = getDownload(id)
    if (download) {
      download.downloadItem.resume()
    }
  })
}

function cloneDownload(download: IDownload) {
  const ret: any = clone(download)
  delete ret.downloadItem

  return ret
}
