import { Menu, MenuItemConstructorOptions, app, shell } from 'electron'
import * as webui from '../window/webui'
import * as prompt from '../window/prompt'
import * as model from '../window/model'
import * as download from '../window/download'
import * as system from '../window/system'
import * as terminal from '../window/terminal'
import * as window from '../lib/window'
import { isMac } from './util'
import { t } from './language'
import upperCase from 'licia/upperCase'
import { getSettingsStore } from './store'

const settingsStore = getSettingsStore()

function getTemplate(): MenuItemConstructorOptions[] {
  const hideMenu = isMac()
    ? [
        {
          type: 'separator',
        },
        {
          label: t('hideVivy'),
          role: 'hide',
        },
        {
          label: t('hideOthers'),
          role: 'hideothers',
        },
        {
          label: t('showAll'),
          role: 'unhide',
        },
      ]
    : []

  const vivy = {
    label: upperCase(app.name),
    submenu: [
      {
        label: t('aboutVivy'),
        click() {
          window.sendTo('main', 'showAbout')
        },
      },
      ...hideMenu,
      {
        type: 'separator',
      },
      {
        label: t('quitVivy'),
        click() {
          window.getWin('main')?.close()
        },
      },
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

  const file = {
    label: t('file'),
    submenu: [
      {
        label: t('new') + '...',
        accelerator: isMac() ? 'Cmd+N' : 'Ctrl+N',
        click() {
          window.sendTo('main', 'newProject')
        },
      },
      {
        label: t('open') + '...',
        accelerator: isMac() ? 'Cmd+O' : 'Ctrl+O',
        click() {
          window.sendTo('main', 'openProject')
        },
      },
      {
        type: 'separator',
      },
      {
        label: t('save'),
        accelerator: isMac() ? 'Cmd+S' : 'Ctrl+S',
        click() {
          window.sendTo('main', 'saveProject')
        },
      },
      {
        label: t('saveAs') + '...',
        accelerator: isMac() ? 'Shift+Cmd+S' : 'Shift+Ctrl+S',
        click() {
          window.sendTo('main', 'saveAsProject')
        },
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
        label: t('downloadManager'),
        click() {
          download.showWin()
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
        label: t('reportIssue'),
        click() {
          shell.openExternal('https://github.com/liriliri/vivy-docs/issues')
        },
      },
      {
        type: 'separator',
      },
      {
        role: 'toggledevtools',
        label: t('toggleDevtools'),
      },
    ],
  }

  const template = [tools, help]
  if (isMac()) {
    template.unshift(vivy, file, edit)
  } else {
    template.unshift(file)
    template.push(vivy)
  }

  return template
}

export function init() {
  const menu = Menu.buildFromTemplate(getTemplate())

  Menu.setApplicationMenu(menu)
}
