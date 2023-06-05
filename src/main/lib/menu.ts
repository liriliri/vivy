import { Menu, MenuItemConstructorOptions, app } from 'electron'
import * as webui from './webui'
import * as prompt from './prompt'
import { isMac } from './util'

function getTemplate(): MenuItemConstructorOptions[] {
  const vivy = {
    label: app.name,
    submenu: [{ role: 'quit' }],
  }

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
        label: 'Prompt Builder',
        click() {
          prompt.showWin()
        },
      },
      {
        label: 'Stable Diffusion Webui',
        click() {
          webui.showWin()
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
