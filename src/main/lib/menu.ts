import { Menu, MenuItemConstructorOptions, app } from 'electron'
import * as webui from '../window/webui'
import * as prompt from '../window/prompt'
import * as model from '../window/model'
import * as system from '../window/system'
import * as terminal from '../window/terminal'
import * as main from '../window/main'
import { isMac, t } from './util'
import upperCase from 'licia/upperCase'
import { getSettingsStore } from './store'

const settingsStore = getSettingsStore()

function getTemplate(): MenuItemConstructorOptions[] {
  const vivy = {
    label: upperCase(app.name),
    submenu: [
      {
        label: t('aboutVivy'),
        click() {
          main.getWin()!.webContents.send('showAbout')
        },
      },
      {
        type: 'separator',
      },
      { role: 'quit', label: t('quitVivy') },
    ],
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
        label: t('sysInfo'),
        click() {
          system.showWin()
        },
      },
    ],
  }

  if (settingsStore.get('enableWebUI')) {
    tools.submenu.push({
      label: 'Stable Diffusion web UI',
      click() {
        webui.showWin()
      },
    })
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
  } else {
    template.push(vivy)
  }

  return template
}

export function init() {
  const menu = Menu.buildFromTemplate(getTemplate())

  Menu.setApplicationMenu(menu)
}
