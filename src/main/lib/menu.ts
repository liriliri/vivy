import { Menu, MenuItemConstructorOptions, app, shell } from 'electron'
import * as webui from '../window/webui'
import * as prompt from '../window/prompt'
import * as model from '../window/model'
import * as download from '../window/download'
import * as system from '../window/system'
import * as terminal from '../window/terminal'
import * as main from '../window/main'
import { isMac, t } from './util'
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
          main.getWin()!.webContents.send('showAbout')
        },
      },
      ...hideMenu,
      {
        type: 'separator',
      },
      {
        label: t('quitVivy'),
        click() {
          main.getWin()!.close()
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
