import { Menu, MenuItemConstructorOptions, app } from 'electron'
import * as webui from './webui'
import * as prompt from './prompt'
import * as model from './model'
import * as terminal from './terminal'
import { isMac, t } from './util'

function getTemplate(): MenuItemConstructorOptions[] {
  const vivy = {
    label: app.name,
    submenu: [{ role: 'quit', label: t('quitVivy') }],
  }

  const edit = {
    label: t('edit'),
    submenu: [
      {
        role: 'cut',
        label: t('cut'),
      },
      {
        role: 'copy',
        label: t('copy'),
      },
      {
        role: 'paste',
        label: t('paste'),
      },
      {
        role: 'delete',
        label: t('delete'),
      },
      {
        role: 'selectAll',
        label: t('selectAll'),
      },
    ],
  }

  const tools = {
    label: t('tools'),
    submenu: [
      {
        label: t('modelManager'),
        click() {
          model.showWin()
        },
      },
      {
        label: t('promptBuilder'),
        click() {
          prompt.showWin()
        },
      },
      {
        label: t('terminal'),
        click() {
          terminal.showWin()
        },
      },
      {
        label: 'Stable Diffusion web UI',
        click() {
          webui.showWin()
        },
      },
    ],
  }

  const help: any = {
    role: 'help',
    label: t('help'),
    submenu: [
      {
        role: 'toggledevtools',
        label: t('toggleDevtools'),
      },
    ],
  }

  const template = [tools, help]
  if (isMac()) {
    template.unshift(vivy, edit)
  }
  return template
}

export function init() {
  const menu = Menu.buildFromTemplate(getTemplate())

  Menu.setApplicationMenu(menu)
}
