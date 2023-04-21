import path from 'path'
import { execa } from 'execa'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function resolve(p) {
  return path.resolve(__dirname, '../', p)
}

async function main() {
  const binPath = resolve('installer_files/env/bin')
  process.env.PATH = `${binPath}:${process.env.PATH}`

  const appDir = resolve('easy-diffusion/ui')
  process.env.SD_UI_PATH = appDir
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
      stdout: 'inherit',
    }
  )
}

main()
