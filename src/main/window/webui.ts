import { BrowserWindow, app } from 'electron'
import { resolveUnpack, getUserDataPath } from '../lib/util'
import isMac from 'licia/isMac'
import getFreePort from 'licia/getPort'
import toStr from 'licia/toStr'
import extend from 'licia/extend'
import isWindows from 'licia/isWindows'
import childProcess, { ChildProcessByStdio } from 'child_process'
import { Readable } from 'stream'
import { getSettingsStore, getWebUIStore } from '../lib/store'
import * as model from '../lib/model'
import { ModelType } from '../../common/types'
import * as window from 'share/main/lib/window'
import pidusage from 'pidusage'
import os from 'os'
import contain from 'licia/contain'
import map from 'licia/map'
import upperCase from 'licia/upperCase'
import startWith from 'licia/startWith'
import toNum from 'licia/toNum'
import { isDev } from 'share/common/util'
import isStrBlank from 'licia/isStrBlank'
import fs from 'fs-extra'
import trim from 'licia/trim'

const settingsStore = getSettingsStore()
const store = getWebUIStore()

let port = 7860
export const getPort = () => port

let isDead = false
let devices: string[] = []
let cuda: string[] = []
let subprocess: ChildProcessByStdio<null, Readable, Readable>

export async function start() {
  let appDir = resolveUnpack('webui/stable-diffusion-webui')
  const scriptDir = resolveUnpack('webui/script')

  const webUIPath = settingsStore.get('webUIPath')
  let useCustomWebUI = false
  if (!isStrBlank(webUIPath) && (await fs.pathExists(webUIPath))) {
    appDir = webUIPath
    useCustomWebUI = true
  }

  let PATH = process.env.PATH
  if (!useCustomWebUI) {
    if (isWindows) {
      const binPath = resolveUnpack('webui/installer_files/env')
      PATH = `${binPath};${PATH}`
    } else {
      const binPath = resolveUnpack('webui/installer_files/env/bin')
      PATH = `${binPath}:${PATH}`
    }
  }

  const env = {
    PATH,
    GIT_PYTHON_REFRESH: 'quiet',
    SD_WEBUI_RESTARTING: '1',
  }

  if (isMac) {
    extend(env, {
      PYTORCH_ENABLE_MPS_FALLBACK: '1',
    })
  }

  port = await getFreePort(port, '127.0.0.1')
  const args = [
    '-u',
    'launch.py',
    '--api',
    '--server-name',
    '127.0.0.1',
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
  args.push('--skip-load-model-at-start')

  args.push('--data-dir', getUserDataPath(''))
  args.push('--ckpt-dir', model.getDir(ModelType.StableDiffusion))
  args.push('--vae-dir', model.getDir(ModelType.VAE))
  args.push('--lora-dir', model.getDir(ModelType.Lora))
  args.push('--ldsr-models-path', model.getDir(ModelType.LDSR))
  args.push('--swinir-models-path', model.getDir(ModelType.SwinIR))
  args.push('--esrgan-models-path', model.getDir(ModelType.ESRGAN))
  args.push('--realesrgan-models-path', model.getDir(ModelType.RealESRGAN))
  args.push('--scunet-models-path', model.getDir(ModelType.ScuNET))
  args.push('--codeformer-models-path', model.getDir(ModelType.CodeFormer))
  args.push('--embeddings-dir', model.getDir(ModelType.Embedding))
  args.push('--dat-models-path', model.getDir(ModelType.DAT))
  args.push('--gfpgan-models-path', model.getDir(ModelType.GFPGAN))
  args.push('--controlnet-dir', model.getDir(ModelType.ControlNet))
  args.push(
    '--controlnet-annotator-models-path',
    model.getDir(ModelType.ControlNet)
  )

  const vramOptimization = settingsStore.get('vramOptimization')
  if (vramOptimization === 'medium') {
    args.push('--medvram')
  } else if (vramOptimization === 'low') {
    args.push('--lowvram')
  }

  if (!settingsStore.get('enableWebUI')) {
    args.push('--nowebui')
  } else if (isDev()) {
    args.push('--no-gradio-queue')
  }

  if (isMac) {
    args.push('--upcast-sampling')
  }

  if (!useCustomWebUI) {
    if (store.get('cuda') && store.get('devices')) {
      cuda = store.get('cuda')
      devices = store.get('devices')
    } else {
      const result: any = JSON.parse(
        await spawn('python', ['-u', 'devices.py'], {
          cwd: scriptDir,
          windowsHide: true,
          env,
        })
      )

      cuda = result.cuda
      store.set('cuda', cuda)
      devices = result.devices
      store.set('devices', devices)
    }

    let device = settingsStore.get('device')
    if (!device || !contain(devices, device)) {
      device = devices[0]
      settingsStore.set('device', device)
    }

    if (device === 'cpu') {
      args.push('--use-cpu', 'all')
    } else if (isMac) {
      args.push('--use-cpu', 'interrogate')
    }

    if (startWith(device, 'cuda')) {
      args.push('--device-id', device.slice(5))
    }

    if (device === 'cpu' || isMac) {
      args.push('--no-half-vae', '--no-half')
    }
  } else if (isMac) {
    args.push('--use-cpu', 'interrogate')
    args.push('--no-half-vae', '--no-half')
  }

  const customArgs = settingsStore.get('customArgs')
  if (!isStrBlank(customArgs)) {
    args.push(...trim(customArgs).split(/\s+/))
  }

  let python = 'python'
  if (useCustomWebUI && !isStrBlank(settingsStore.get('pythonPath'))) {
    python = settingsStore.get('pythonPath')
  }

  extend(process.env, env)
  subprocess = childProcess.spawn(python, args, {
    cwd: appDir,
    windowsHide: true,
    stdio: ['inherit', 'pipe', 'pipe'],
  })
  subprocess.stdout.on('data', (data) => process.stdout.write(data))
  subprocess.stderr.on('data', (data) => process.stderr.write(data))
  subprocess.on('exit', (code, signal) => {
    console.log('Stable Diffusion web UI exit', code, signal)
    isDead = true
  })
  subprocess.on('error', (err) => {
    console.log('Stable Diffusion web UI error', err)
    if (!subprocess.pid) {
      isDead = true
    }
    window.sendAll('webUIError')
  })

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
    name: 'webui',
    minHeight: 850,
    minWidth: 1280,
    ...store.get('bounds'),
    maximized: store.get('maximized'),
    onSavePos: () => window.savePos(win, store, true),
  })
  win.on('close', () => {
    win?.destroy()
    win = null
  })

  window.loadPage(win, { page: 'webui' })
}

const cpuCount = os.cpus().length

export function getCpuAndRam(): Promise<{
  cpu: number
  ram: number
}> {
  return new Promise((resolve, reject) => {
    if (isDead || !subprocess.pid) {
      return resolve({
        cpu: 0,
        ram: 0,
      })
    }

    pidusage(subprocess.pid, (err, stats) => {
      if (err) {
        return reject(err)
      }

      resolve({
        cpu: stats.cpu / cpuCount,
        ram: stats.memory,
      })
    })
  })
}
