import { execa } from 'execa'
import isWindows from 'licia/isWindows.js'
import { resolve } from './util.mjs'

async function main() {
  const appDir = resolve('ui')

  let PATH = process.env.PATH
  if (isWindows) {
    const binPath = resolve('installer_files/env')
    PATH = `${binPath};${PATH}`
  } else {
    const binPath = resolve('installer_files/env/bin')
    PATH = `${binPath}:${PATH}`
  }

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
        PATH,
        SD_UI_PATH: appDir,
        PYTORCH_ENABLE_MPS_FALLBACK: '1',
      },
    }
  )
}

main()
