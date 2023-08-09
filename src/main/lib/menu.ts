import { Menu, MenuItemConstructorOptions, app } from 'electron'
import * as webui from './webui'
import * as prompt from './prompt'
import * as model from './model'
import * as terminal from './terminal'
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
        role: 'cut',
      },
      {
        role: 'copy',
      },
      {
        role: 'paste',
      },
      {
        role: 'delete',
      },
      {
        role: 'selectAll',
      },
    ],
  }

  const tools = {
    label: 'Tools',
    submenu: [
      {
        label: 'Model Manager',
        click() {
          model.showWin()
        },
      },
      {
        label: 'Prompt Builder',
        click() {
          prompt.showWin()
        },
      },
      {
        label: 'Terminal',
        click() {
          terminal.showWin()
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

  const template = [tools, help]
  if (isMac()) {
    template.unshift(edit, vivy)
  }
  return template
}

export function init() {
  const menu = Menu.buildFromTemplate(getTemplate())

  Menu.setApplicationMenu(menu)
}
