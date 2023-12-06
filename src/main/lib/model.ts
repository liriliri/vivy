import { getSettingsStore } from './store'
import path from 'path'
import fs from 'fs-extra'
import filter from 'licia/filter'
import splitPath from 'licia/splitPath'
import contain from 'licia/contain'
import { IModel, ModelType } from '../../common/types'
import { shell } from 'electron'
import { glob } from 'glob'
import chokidar from 'chokidar'
import debounce from 'licia/debounce'
import startWith from 'licia/startWith'
import { sendAll } from './util'

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
ensureDir(ModelType.RealESRGAN)
ensureDir(ModelType.ScuNET)
ensureDir(ModelType.Embedding)

export function getDir(type: ModelType) {
  const modelPath = settingsStore.get('modelPath')

  return path.join(modelPath, type)
}

const fileExts = {
  [ModelType.StableDiffusion]: ['.safetensors', '.ckpt'],
  [ModelType.RealESRGAN]: ['.pth'],
  [ModelType.Lora]: ['.safetensors'],
  [ModelType.ScuNET]: ['.pth'],
  [ModelType.Embedding]: ['.safetensors', '.pt'],
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
    const stat = await fs.stat(path.resolve(dir, file))
    models.push({
      name: file.slice(dir.length + 1),
      size: stat.size,
      createdDate: stat.birthtime.getTime(),
    })
  }

  return models
}

export function openDir(type: ModelType) {
  shell.openPath(getDir(type))
}

export async function deleteModel(type: ModelType, name: string) {
  const dir = getDir(type)
  await fs.unlink(path.resolve(dir, name))
}

export function init() {
  chokidar.watch(settingsStore.get('modelPath')).on(
    'all',
    debounce((event, path) => {
      if (!contain(['add', 'unlink'], event)) {
        return
      }
      let type: ModelType | null = null
      if (startWith(path, getDir(ModelType.StableDiffusion))) {
        type = ModelType.StableDiffusion
      } else if (startWith(path, getDir(ModelType.Lora))) {
        type = ModelType.Lora
      } else if (startWith(path, getDir(ModelType.Embedding))) {
        type = ModelType.Embedding
      }
      if (type) {
        const exts = getFileExt(type)
        const { ext } = splitPath(path)
        if (contain(exts, ext)) {
          sendAll('refreshModel', type)
        }
      }
    }, 1000)
  )
}
