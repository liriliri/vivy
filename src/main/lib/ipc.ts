import { ipcMain } from 'electron'
import * as easyDiffusion from './easyDiffusion'

export function init() {
  ipcMain.handle('getEasyDiffusionPort', () => easyDiffusion.getPort())
}
