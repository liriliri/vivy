import { Menu, MenuItemConstructorOptions, app, BrowserWindow } from 'electron'
import * as easyDiffusion from './easyDiffusion'
import { isMac } from './util'

function getTemplate(): MenuItemConstructorOptions[] {
  const vivy = {
    label: app.name,
    submenu: [{ role: 'quit' }],
  }

  let easyDiffusionWin: BrowserWindow | null = null

  const edit = {
    label: 'Edit',
    submenu: [
      {
        role: 'copy',
      },
      {
        role: 'paste',
      },
    ],
  }

  const tools = {
    label: 'Tools',
    submenu: [
      {
        label: 'Easy Diffusion',
        click() {
          if (easyDiffusionWin && !easyDiffusionWin.isDestroyed()) {
            easyDiffusionWin.focus()
            return
          }
          easyDiffusionWin = new BrowserWindow({
            title: 'Easy Diffusion',
            minimizable: false,
            maximizable: false,
            width: 1000,
            height: 650,
            minHeight: 650,
            minWidth: 1000,
          })
          easyDiffusionWin.on('close', () => easyDiffusionWin?.destroy())
          easyDiffusionWin.loadURL(
            `http://localhost:${easyDiffusion.getPort()}`
          )
        },
      },
    ],
  }

  const help: any = {
    role: 'help',
    submenu: [
      {
        role: 'toggledevtools',
      },
    ],
  }

  const template = [edit, tools, help]
  if (isMac()) {
    template.unshift(vivy)
  }
  return template
}

export function init() {
  const menu = Menu.buildFromTemplate(getTemplate())

  Menu.setApplicationMenu(menu)
}
