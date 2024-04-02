import { BrowserWindow, app } from 'electron'
import { resolveUnpack, isMac, getUserDataPath } from '../lib/util'
import getFreePort from 'licia/getPort'
import toStr from 'licia/toStr'
import extend from 'licia/extend'
import isWindows from 'licia/isWindows'
import childProcess, { ChildProcessByStdio } from 'child_process'
import { Readable } from 'stream'
import { getSettingsStore, getWebUIStore } from '../lib/store'
import * as model from '../lib/model'
import { ModelType } from '../../common/types'
import * as window from '../lib/window'
import pidusage from 'pidusage'
import os from 'os'

const settingsStore = getSettingsStore()
const store = getWebUIStore()

let port = 7860
export const getPort = () => port

let subprocess: ChildProcessByStdio<null, Readable, Readable>
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
    GIT_PYTHON_REFRESH: 'quiet',
    SD_WEBUI_RESTARTING: '1',
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
  const args = [
    '-u',
    'launch.py',
    '--api',
    '--port',
    toStr(port),
    '--no-download-sd-model',
    '--skip-prepare-environment',
    '--skip-install',
    '--skip-python-version-check',
    '--skip-torch-cuda-test',
    '--skip-version-check',
    '--no-hashing',
  ]

  args.push('--data-dir', getUserDataPath(''))
  args.push('--ckpt-dir', model.getDir(ModelType.StableDiffusion))
  args.push('--vae-dir', model.getDir(ModelType.VAE))
  args.push('--lora-dir', model.getDir(ModelType.Lora))
  args.push('--ldsr-models-path', model.getDir(ModelType.LDSR))
  args.push('--swinir-models-path', model.getDir(ModelType.SwinIR))
  args.push('--esrgan-models-path', model.getDir(ModelType.ESRGAN))
  args.push('--realesrgan-models-path', model.getDir(ModelType.RealESRGAN))
  args.push('--scunet-models-path', model.getDir(ModelType.ScuNET))
  args.push('--embeddings-dir', model.getDir(ModelType.Embedding))
  args.push('--dat-models-path', model.getDir(ModelType.DAT))

  if (!settingsStore.get('enableWebUI')) {
    args.push('--nowebui')
  }

  subprocess = childProcess.spawn('python', args, {
    cwd: appDir,
    windowsHide: true,
    stdio: ['inherit', 'pipe', 'pipe'],
    env,
  })
  subprocess.stdout.on('data', (data) => process.stdout.write(data))
  subprocess.stderr.on('data', (data) => process.stderr.write(data))

  app.on('will-quit', () => subprocess.kill())
}

export function isRunning() {
  return !subprocess.killed
}

export function quit() {
  if (subprocess) {
    subprocess.kill()
  }
}

let win: BrowserWindow | null = null

export function showWin() {
  if (win) {
    win.focus()
    return
  }
  win = window.create({
    customTitlebar: false,
    minHeight: 850,
    minWidth: 1280,
    preload: false,
    ...store.get('bounds'),
    onSavePos: () => store.set('bounds', win?.getBounds()),
  })
  win.on('close', () => {
    win?.destroy()
    win = null
  })
  win.loadURL(`http://localhost:${getPort()}`)
}

const cpuCount = os.cpus().length

export function getCpuAndMem(): Promise<{
  cpu: number
  mem: number
}> {
  return new Promise((resolve, reject) => {
    if (!subprocess) {
      return resolve({
        cpu: 0,
        mem: 0,
      })
    }

    pidusage(subprocess.pid, (err, stats) => {
      if (err) {
        return reject(err)
      }

      resolve({
        cpu: stats.cpu / cpuCount,
        mem: stats.memory,
      })
    })
  })
}
