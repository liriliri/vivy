import { ipcMain } from 'electron'
import * as webui from './webui'

export function init() {
  ipcMain.handle('getWebuiPort', () => webui.getPort())
}
