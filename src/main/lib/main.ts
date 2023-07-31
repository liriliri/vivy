import path from 'path'
import { isDev } from './util'
import { BrowserWindow, ipcMain, app } from 'electron'
import * as webui from './webui'
import * as logger from './logger'
import FileStore from 'licia/FileStore'
import { getUserDataPath } from './util'
import fs from 'licia/fs'
import mkdir from 'licia/mkdir'

const store = new FileStore(getUserDataPath('data/main.json'), {
  bounds: {
    width: 1280,
    height: 850,
  },
})

fs.exists(getUserDataPath('data')).then((exists) => {
  if (!exists) {
    mkdir(getUserDataPath('data'))
  }
})

let win: BrowserWindow | null = null

export function getWin() {
  return win
}

let isIpcInit = false

export function showWin() {
  if (!isIpcInit) {
    isIpcInit = true
    initIpc()
  }

  win = new BrowserWindow({
    title: 'VIVY',
    minWidth: 1280,
    minHeight: 850,
    ...store.get('bounds'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      webSecurity: false,
      sandbox: false,
    },
    show: false,
  })
  win.once('ready-to-show', () => win?.show())
  win.on('close', () => app.quit())
  const savePos = () => store.set('bounds', win?.getBounds())
  win.on('resize', savePos)
  win.on('moved', savePos)

  if (isDev()) {
    win.loadURL('http://localhost:8080')
  } else {
    win.loadFile(path.resolve(__dirname, '../renderer/index.html'))
  }
}

function initIpc() {
  ipcMain.handle('getWebuiPort', () => webui.getPort())
  ipcMain.handle('showLogger', () => logger.showWin())
}
