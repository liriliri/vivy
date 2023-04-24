import { app, BrowserWindow } from 'electron'
import { isDev, resolve } from './lib/util'
import { execa } from 'execa'

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null

async function createWindow() {
  win = new BrowserWindow({
    title: 'VIVY',
  })

  if (isDev()) {
    win.loadURL('http://localhost:8080')
  }
}

async function startEasyDiffusion() {
  const binPath = resolve('installer_files/env/bin')

  const appDir = resolve('easy-diffusion/ui')
  await execa(
    'uvicorn',
    [
      'main:server_api',
      '--app-dir',
      appDir,
      '--port',
      '9000',
      '--host',
      '0.0.0.0',
      '--log-level',
      'error',
    ],
    {
      cwd: appDir,
      stdio: 'inherit',
      env: {
        PATH: `${binPath}:${process.env.PATH}`,
        SD_UI_PATH: appDir,
        PYTORCH_ENABLE_MPS_FALLBACK: '1',
      },
    }
  )
}

app.on('ready', createWindow)
app.on('ready', startEasyDiffusion)

app.on('second-instance', () => {
  if (win) {
    if (win.isMaximized()) {
      win.restore()
    }
    win.focus()
  }
})
