import { ipcMain } from 'electron'
import * as easyDiffusion from './easyDiffusion'
import * as webui from './webui'

export function init() {
  ipcMain.handle('getEasyDiffusionPort', () => easyDiffusion.getPort())
  ipcMain.handle('getWebuiPort', () => webui.getPort())
}
