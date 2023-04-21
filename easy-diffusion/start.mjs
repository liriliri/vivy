import path from 'path'
import { execa } from 'execa'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function resolve(p) {
  return path.resolve(__dirname, '../', p)
}

async function main() {
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
        PYTORCH_ENABLE_MPS_FALLBACK: 1,
      },
    }
  )
}

main()
