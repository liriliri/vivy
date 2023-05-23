import { execa } from 'execa'
import { BrowserWindow } from 'electron'
import { resolve, isMac } from './util'
import getFreePort from 'licia/getPort'
import toStr from 'licia/toStr'
import extend from 'licia/extend'
import isWindows from 'licia/isWindows'

let port = 7860
export const getPort = () => port

export async function start() {
  const appDir = resolve('webui/stable-diffusion-webui')

  let PATH = process.env.PATH
  if (isWindows) {
    const binPath = resolve('webui/installer_files/env')
    PATH = `${binPath};${PATH}`
  } else {
    const binPath = resolve('webui/installer_files/env/bin')
    PATH = `${binPath}:${PATH}`
  }

  const env = {
    PATH,
  }

  if (isMac()) {
    extend(env, {
      COMMANDLINE_ARGS:
        '--skip-torch-cuda-test --upcast-sampling --no-half-vae --no-half --use-cpu interrogate',
      TORCH_COMMAND: 'pip install torch torchvision',
      K_DIFFUSION_REPO: 'https://github.com/brkirch/k-diffusion.git',
      K_DIFFUSION_COMMIT_HASH: '51c9778f269cedb55a4d88c79c0246d35bdadb71',
      PYTORCH_ENABLE_MPS_FALLBACK: '1',
    })
  }

  port = await getFreePort(port)
  await execa('python', ['launch.py', '--api', '--port', toStr(port)], {
    cwd: appDir,
    stdout: 'inherit',
    stderr: 'inherit',
    env,
  })
}

let webuiWin: BrowserWindow | null = null

export function showWin() {
  if (webuiWin && !webuiWin.isDestroyed()) {
    webuiWin.focus()
    return
  }
  webuiWin = new BrowserWindow({
    title: 'Easy Diffusion',
    minimizable: false,
    maximizable: false,
    width: 1280,
    height: 850,
    minHeight: 850,
    minWidth: 1280,
  })
  webuiWin.setMenu(null)
  webuiWin.on('close', () => webuiWin?.destroy())
  webuiWin.loadURL(`http://localhost:${getPort()}`)
}
