import { BrowserWindow, DownloadItem, session } from 'electron'
import createWin from './createWin'
import { isDev } from '../lib/util'
import path from 'path'
import { getDownloadStore } from '../lib/store'
import { ModelType } from '../../common/types'
import * as model from '../lib/model'
import uuid from 'licia/uuid'

const store = getDownloadStore()

let win: BrowserWindow | null = null

export function showWin() {
  if (win) {
    win.focus()
    return
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

let mainWin: BrowserWindow | null = null

export function init(win: BrowserWindow) {
  mainWin = win
}

let downloadModelOptions: IDownloadModelOptions | null = null

interface IDownloadModelOptions {
  url: string
  fileName: string
  type: ModelType
}

export function downloadModel(options: IDownloadModelOptions) {
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
  speed: number
  totalBytes: number
  receivedBytes: number
  downloadItem: DownloadItem
}

const downloads: IDownload[] = []

session.defaultSession.on('will-download', function (_, item) {
  if (!downloadModelOptions) {
    return
  }

  const { type } = downloadModelOptions
  const savePath = model.getDir(type)
  item.setSavePath(savePath)

  downloads.push({
    id: uuid(),
    url: downloadModelOptions.url,
    fileName: downloadModelOptions.fileName,
    speed: 0,
    totalBytes: item.getTotalBytes(),
    receivedBytes: item.getReceivedBytes(),
    downloadItem: item,
  })

  downloadModelOptions = null
})
