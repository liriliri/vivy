import { Menu, MenuItemConstructorOptions, shell, app } from 'electron'
import * as easyDiffusion from './easyDiffusion'
import { isMac } from './util'

function getTemplate(): MenuItemConstructorOptions[] {
  const vivy = {
    label: app.name,
    submenu: [{ role: 'quit' }],
  }

  const tools = {
    label: 'Tools',
    submenu: [
      {
        label: 'Easy Diffusion',
        click() {
          shell.openExternal(`http://localhost:${easyDiffusion.getPort()}`)
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

  const template = [tools, help]
  if (isMac()) {
    template.unshift(vivy)
  }
  return template
}

export function init() {
  const menu = Menu.buildFromTemplate(getTemplate())

  Menu.setApplicationMenu(menu)
}
