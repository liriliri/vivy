import { execa } from 'execa'
import { resolve } from './util'
import toStr from 'licia/toStr'
import getPort from 'licia/getPort'
import config from './config'

export async function start() {
  const binPath = resolve('easy-diffusion/installer_files/env/bin')
  const appDir = resolve('easy-diffusion/ui')

  const port = await getPort(config.easyDiffusionPort)
  config.easyDiffusionPort = port
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
        PATH: `${binPath}:${process.env.PATH}`,
        SD_UI_PATH: appDir,
        PYTORCH_ENABLE_MPS_FALLBACK: '1',
      },
    }
  )
}
