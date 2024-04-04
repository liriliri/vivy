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
import contain from 'licia/contain'
import map from 'licia/map'
import upperCase from 'licia/upperCase'
import startWith from 'licia/startWith'
import toNum from 'licia/toNum'

const settingsStore = getSettingsStore()
const store = getWebUIStore()

let port = 7860
export const getPort = () => port

let isDead = false
let devices: string[] = []
let cuda: string[] = []
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

  if (isMac()) {
    args.push('--upcast-sampling')
  }

  const result: any = JSON.parse(
    await spawn('python', ['-u', 'devices.py'], {
      cwd: appDir,
      windowsHide: true,
      env,
    })
  )

  cuda = result.cuda
  devices = result.devices
  let device = settingsStore.get('device')
  if (!device || !contain(devices, device)) {
    device = devices[0]
    settingsStore.set('device', device)
  }

  if (device === 'cpu') {
    args.push('--use-cpu', 'all')
  } else if (isMac()) {
    args.push('--use-cpu', 'interrogate')
  }

  if (startWith(device, 'cuda')) {
    args.push('--device-id', device.slice(5))
  }

  if (device === 'cpu' || isMac()) {
    args.push('--no-half-vae', '--no-half')
  }

  subprocess = childProcess.spawn('python', args, {
    cwd: appDir,
    windowsHide: true,
    stdio: ['inherit', 'pipe', 'pipe'],
    env,
  })
  subprocess.stdout.on('data', (data) => process.stdout.write(data))
  subprocess.stderr.on('data', (data) => process.stderr.write(data))
  subprocess.on('exit', () => (isDead = true))
  subprocess.on('error', () => window.sendAll('webUIError'))

  app.on('will-quit', () => subprocess.kill())
}

function spawn(command: string, args: string[], options: any): Promise<string> {
  return new Promise((resolve) => {
    const child = childProcess.spawn(command, args, options)
    let result = ''
    child.stdout.on('data', (data) => (result += data))
    child.on('close', function () {
      resolve(result)
    })
  })
}

export function getDevices() {
  return map(devices, (device) => {
    let name = device
    switch (device) {
      case 'mps':
      case 'cpu':
        name = upperCase(device)
        break
    }

    if (startWith(device, 'cuda')) {
      const num = toNum(device.slice(5))
      name = cuda[num]
    }

    return {
      id: device,
      name,
    }
  })
}

export function isRunning() {
  return !isDead
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
