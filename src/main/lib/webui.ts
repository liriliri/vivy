import { BrowserWindow, app } from 'electron'
import { resolveUnpack, isMac, getUserDataPath } from './util'
import getFreePort from 'licia/getPort'
import toStr from 'licia/toStr'
import extend from 'licia/extend'
import isWindows from 'licia/isWindows'
import childProcess from 'child_process'

let port = 7860
export const getPort = () => port

export async function start() {
  const appDir = resolveUnpack('webui/stable-diffusion-webui')

  let PATH = process.env.PATH
  if (isWindows) {
    const binPath = resolveUnpack('webui/installer_files/env')
    PATH = `${binPath};${PATH}`
  } else {
    const binPath = resolveUnpack('webui/installer_files/env/bin')
    PATH = `${binPath}:${PATH}`
  }

  const env = {
    PATH,
  }

  if (isMac()) {
    extend(env, {
      COMMANDLINE_ARGS:
        '--skip-torch-cuda-test --upcast-sampling --no-half-vae --no-half --use-cpu interrogate',
      TORCH_COMMAND: 'pip install torch==2.0.1 torchvision==0.15.2',
      K_DIFFUSION_REPO: 'https://github.com/brkirch/k-diffusion.git',
      K_DIFFUSION_COMMIT_HASH: '51c9778f269cedb55a4d88c79c0246d35bdadb71',
      PYTORCH_ENABLE_MPS_FALLBACK: '1',
    })
  }

  port = await getFreePort(port, '127.0.0.1')
  const subprocess = childProcess.spawn(
    'python',
    [
      '-u',
      'launch.py',
      '--skip-prepare-environment',
      '--api',
      '--port',
      toStr(port),
      '--ckpt-dir',
      getUserDataPath('models'),
    ],
    {
      cwd: appDir,
      windowsHide: true,
      stdio: ['inherit', 'pipe', 'pipe'],
      env,
    }
  )
  subprocess.stdout.on('data', (data) => process.stdout.write(data))
  subprocess.stderr.on('data', (data) => process.stderr.write(data))

  app.on('will-quit', () => subprocess.kill())
}

let win: BrowserWindow | null = null

export function showWin() {
  if (win) {
    win.focus()
    return
  }
  win = new BrowserWindow({
    title: 'Stable Diffusion web UI',
    minimizable: false,
    maximizable: false,
    width: 1280,
    height: 850,
    minHeight: 850,
    minWidth: 1280,
    show: false,
  })
  win.setMenu(null)
  win.once('ready-to-show', () => win?.show())
  win.on('close', () => {
    win?.destroy()
    win = null
  })
  win.loadURL(`http://localhost:${getPort()}`)
}
