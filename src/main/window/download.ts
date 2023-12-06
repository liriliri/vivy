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

export function downloadModel(options: IDownloadModelOptions) {
  const mainWin = main.getWin()
  if (!mainWin) {
    return
  }
  downloadModelOptions = options
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
}

const downloads: IDownload[] = []

export function init() {
  session.defaultSession.on('will-download', function (_, item) {
    if (!downloadModelOptions) {
      return
    }

    const { type, fileName } = downloadModelOptions
    const savePath = path.join(model.getDir(type), fileName)
    item.setSavePath(savePath + '.vivydownload')

    let prevReceivedBytes = 0

    item.on('updated', (e, state) => {
      download.totalBytes = item.getTotalBytes()
      download.receivedBytes = item.getReceivedBytes()
      download.state = state
      download.speed = download.receivedBytes - prevReceivedBytes
      prevReceivedBytes = download.receivedBytes
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
    }
    downloads.push(download)
    if (win) {
      win.webContents.send('addDownload', cloneDownload(download))
    }

    downloadModelOptions = null
  })
}

function initIpc() {
  ipcMain.handle('getDownloads', () =>
    map(downloads, (download) => cloneDownload(download))
  )
}

function cloneDownload(download: IDownload) {
  const ret: any = clone(download)
  delete ret.downloadItem

  return ret
}
