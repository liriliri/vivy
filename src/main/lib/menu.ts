import { Menu, MenuItemConstructorOptions, shell } from 'electron'
import config from './config'

const help: any = {
  role: 'help',
  submenu: [
    {
      role: 'toggledevtools',
    },
    {
      label: 'Easy Diffusion',
      click() {
        shell.openExternal(`http://localhost:${config.easyDiffusionPort}`)
      },
    },
  ],
}

const template: MenuItemConstructorOptions[] = [help]

export function init() {
  const menu = Menu.buildFromTemplate(template)

  Menu.setApplicationMenu(menu)
}
