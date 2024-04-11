import { getSettingsStore } from './store'
import path from 'path'
import fs from 'fs-extra'
import filter from 'licia/filter'
import splitPath from 'licia/splitPath'
import contain from 'licia/contain'
import { IModel, ModelType, modelTypes } from '../../common/types'
import { shell } from 'electron'
import { glob } from 'glob'
import chokidar from 'chokidar'
import debounce from 'licia/debounce'
import startWith from 'licia/startWith'
import mime from 'licia/mime'
import * as window from './window'
import { getUserDataPath, replaceExt } from './util'

const settingsStore = getSettingsStore()

function ensureDir(type: ModelType) {
  const dir = getDir(type)
  fs.exists(getDir(type), (exists) => {
    if (!exists) {
      fs.mkdirp(dir)
    }
  })
}

ensureDir(ModelType.StableDiffusion)
ensureDir(ModelType.Lora)
ensureDir(ModelType.LDSR)
ensureDir(ModelType.ESRGAN)
ensureDir(ModelType.RealESRGAN)
ensureDir(ModelType.ScuNET)
ensureDir(ModelType.Embedding)
ensureDir(ModelType.SwinIR)
ensureDir(ModelType.VAE)

export function getDir(type: ModelType) {
  if (type === ModelType.BLIP) {
    return path.join(getUserDataPath('models'), 'BLIP')
  }
  if (type === ModelType.Deepdanbooru) {
    return path.join(getUserDataPath('models'), 'torch_deepdanbooru')
  }

  const modelPath = settingsStore.get('modelPath')

  return path.join(modelPath, type)
}

const fileExts = {
  [ModelType.StableDiffusion]: ['.safetensors', '.ckpt'],
  [ModelType.ESRGAN]: ['.pth'],
  [ModelType.LDSR]: ['.ckpt'],
  [ModelType.RealESRGAN]: ['.pth'],
  [ModelType.Lora]: ['.safetensors'],
  [ModelType.ScuNET]: ['.pth'],
  [ModelType.Embedding]: ['.safetensors', '.pt'],
  [ModelType.SwinIR]: ['.pth'],
  [ModelType.VAE]: ['.ckpt', '.pt'],
}

export function getFileExt(type: ModelType) {
  return fileExts[type] || []
}

export async function getModels(type: ModelType) {
  const dir = getDir(type)
  let files = await glob(`${dir}/**/**`)
  const exts = getFileExt(type)
  files = filter(files, (file) => {
    const { ext } = splitPath(file)

    return contain(exts, ext)
  })
  const models: IModel[] = []
  for (let i = 0, len = files.length; i < len; i++) {
    const file = files[i]
    const p = path.resolve(dir, file)
    const stat = await fs.stat(p)

    models.push({
      name: file.slice(dir.length + 1),
      size: stat.size,
      path: p,
      createdDate: stat.birthtime.getTime(),
      preview: await getModelPreview(file),
    })
  }

  return models
}

const previewExts = ['.png', '.jpg', '.jpeg', '.webp']
async function getModelPreview(file: string) {
  for (let i = 0, len = previewExts.length; i < len; i++) {
    const p = replaceExt(file, previewExts[i])
    if (await fs.pathExists(p)) {
      return p
    }
  }
  return ''
}

export function openDir(type: ModelType) {
  shell.openPath(getDir(type))
}

export function exists(type: ModelType, name: string) {
  const dir = getDir(type)
  return fs.existsSync(path.resolve(dir, name))
}

export async function deleteModel(type: ModelType, name: string) {
  const dir = getDir(type)
  await fs.unlink(path.resolve(dir, name))
}

export async function addModel(type: ModelType, filePath: string) {
  const dir = getDir(type)
  const { name } = splitPath(filePath)
  await fs.copy(filePath, path.resolve(dir, name))
  window.sendAll('refreshModel', type)
}

export async function setModelPreview(
  type: ModelType,
  name: string,
  data: string,
  mimeType: string
) {
  const dir = getDir(type)
  const file = path.resolve(dir, name)
  const preview = await getModelPreview(file)
  if (preview) {
    await fs.unlink(preview)
  }

  const buf = Buffer.from(data, 'base64')
  const ext = `.${mime(mimeType)}`
  const previewPath = replaceExt(file, ext)
  await fs.writeFile(previewPath, buf)
}

export function init() {
  chokidar.watch(settingsStore.get('modelPath')).on(
    'all',
    debounce((event, path) => {
      if (!contain(['add', 'unlink'], event)) {
        return
      }
      let type: ModelType | null = null

      for (const i in modelTypes) {
        const modelType = modelTypes[i]
        if (startWith(path, getDir(modelType))) {
          type = modelType
          break
        }
      }
      if (type) {
        const exts = getFileExt(type)
        const { ext } = splitPath(path)
        if (contain(exts, ext)) {
          window.sendAll('refreshModel', type)
        }
      }
    }, 1000)
  )
}
