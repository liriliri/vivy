import { execa } from 'execa'
import { resolve } from './util'
import toStr from 'licia/toStr'
import getFreePort from 'licia/getPort'
import isWindows from 'licia/isWindows'
import { BrowserWindow } from 'electron'

let port = 9000
export const getPort = () => port

export async function start() {
  const appDir = resolve('easy-diffusion/ui')

  let PATH = process.env.PATH
  if (isWindows) {
    const binPath = resolve('easy-diffusion/installer_files/env')
    PATH = `${binPath};${PATH}`
  } else {
    const binPath = resolve('easy-diffusion/installer_files/env/bin')
    PATH = `${binPath}:${PATH}`
  }

  port = await getFreePort(port)
  await execa(
    'uvicorn',
    [
      'main:server_api',
      '--app-dir',
      appDir,
      '--port',
      toStr(port),
      '--host',
      '0.0.0.0',
      '--log-level',
      'error',
    ],
    {
      cwd: appDir,
      stdio: 'inherit',
      env: {
        PATH,
        SD_UI_PATH: appDir,
        PYTORCH_ENABLE_MPS_FALLBACK: '1',
      },
    }
  )
}

let easyDiffusionWin: BrowserWindow | null = null

export function showWin() {
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
  easyDiffusionWin.setMenu(null)
  easyDiffusionWin.on('close', () => easyDiffusionWin?.destroy())
  easyDiffusionWin.loadURL(`http://localhost:${getPort()}`)
}
