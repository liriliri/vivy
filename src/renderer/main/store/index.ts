import {
  action,
  isObservable,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from 'mobx'
import clone from 'licia/clone'
import uuid from 'licia/uuid'
import startWith from 'licia/startWith'
import base64 from 'licia/base64'
import remove from 'licia/remove'
import map from 'licia/map'
import convertBin from 'licia/convertBin'
import idxOf from 'licia/idxOf'
import extend from 'licia/extend'
import * as webui from '../../lib/webui'
import { getSystemLanguage, getImageSize, toDataUrl } from '../../lib/util'
import { parseImage } from '../../lib/genData'
import isDarkMode from 'licia/isDarkMode'
import { IImage, ITxt2ImgOptions } from './types'
import { Task, TaskStatus } from './task'
import fileType from 'licia/fileType'

interface IOptions {
  model: string
}

class Store {
  txt2imgOptions: ITxt2ImgOptions = {
    prompt: '',
    negativePrompt: '',
    model: '',
    sampler: 'Euler a',
    steps: 20,
    seed: -1,
    width: 512,
    height: 512,
    batchSize: 2,
    cfgScale: 7,
  }
  options: IOptions = {
    model: '',
  }
  isReady = false
  models: string[] = []
  samplers: string[] = []
  images: IImage[] = []
  selectedImage?: IImage
  tasks: Task[] = []
  ui = {
    imageListHeight: 181,
    imageListItemSize: 112,
    imageListMaximized: false,
    imageViewerMaximized: false,
    sidebarWidth: 400,
  }
  settings = {
    language: getSystemLanguage(),
    theme: isDarkMode() ? 'dark' : 'light',
    enableWebUI: false,
    modelPath: '',
  }
  constructor() {
    makeObservable(this, {
      txt2imgOptions: observable,
      isReady: observable,
      tasks: observable,
      models: observable,
      samplers: observable,
      images: observable,
      options: observable,
      selectedImage: observable,
      ui: observable,
      settings: observable,
      waitForReady: action,
      setTxt2ImgOptions: action,
      setUi: action,
      createTask: action,
      selectImage: action,
      selectNextImage: action,
      selectPrevImage: action,
      deleteAllImages: action,
      deleteImage: action,
      addFiles: action,
      setSetting: action,
    })
    this.load()

    this.waitForReady()
  }
  selectImage(image?: IImage) {
    this.selectedImage = image
  }
  selectPrevImage() {
    const { selectedImage, images } = this

    if (!selectedImage) {
      return
    }

    const idx = images.indexOf(selectedImage)
    let nextIdx = idx - 1
    if (nextIdx < 0) {
      nextIdx = images.length - 1
    }
    this.selectImage(images[nextIdx])
  }
  selectNextImage() {
    const { selectedImage, images } = this

    if (!selectedImage) {
      return
    }

    const idx = images.indexOf(selectedImage)
    let nextIdx = idx + 1
    if (nextIdx >= images.length) {
      nextIdx = 0
    }
    this.selectImage(images[nextIdx])
  }
  deleteImage(image: IImage) {
    const { images, selectedImage } = this
    if (image === selectedImage) {
      let idx = idxOf(images, selectedImage) + 1
      if (idx === images.length) {
        idx -= 2
      }
      this.selectImage(images[idx])
    }
    remove(images, (item: IImage) => item === image)
  }
  deleteAllImages() {
    this.selectImage()
    this.images = []
  }
  async addFiles(files: FileList) {
    for (let i = 0, len = files.length; i < len; i++) {
      const file = files[i]
      const buf = await convertBin.blobToArrBuffer(file)
      const type = fileType(buf)
      if (!type || !startWith(type.mime, 'image/')) {
        continue
      }
      const data = await convertBin(buf, 'base64')
      const imageInfo = await parseImage(data, type.mime)
      const image = {
        id: uuid(),
        data,
        info: {
          size: base64.decode(data).length,
          ...imageInfo,
        },
      }
      this.selectImage(image)
      this.images.push(this.selectedImage!)
    }
  }
  async load() {
    const txt2imgOptions = await this.getStore('txt2imgOptions')
    if (txt2imgOptions) {
      extend(this.txt2imgOptions, txt2imgOptions)
    }

    const ui = await this.getStore('ui')
    if (ui) {
      extend(this.ui, ui)
    }

    await this.loadSetting('language')
    await this.loadSetting('theme')
    await this.loadSetting('enableWebUI')
    await this.loadSetting('modelPath')
  }
  async loadSetting(name: string) {
    const val = await this.getSetting(name)
    if (val) {
      this.settings[name] = val
    }
  }
  async getStore(name: string) {
    return await main.getMainStore(name)
  }
  async setStore(name: string, val: any) {
    await main.setMainStore(name, isObservable(val) ? toJS(val) : val)
  }
  async getSetting(name: string) {
    return await main.getSettingsStore(name)
  }
  async setSetting(name: string, val: any) {
    this.settings[name] = val
    await main.setSettingsStore(name, isObservable(val) ? toJS(val) : val)
  }
  async stop() {
    await this.interrupt()
    const task = this.tasks[0]
    if (task && task.status === TaskStatus.Generating) {
      this.tasks = [task]
    } else {
      this.tasks = []
    }
  }
  async interrupt() {
    if (this.tasks.length > 0) {
      await webui.interrupt()
    }
  }
  async getOptions() {
    const options = await webui.getOptions()
    this.options = {
      model: options.sd_model_checkpoint,
    }
  }
  async getSamplers() {
    const samplers = await webui.getSamplers()
    this.samplers = map(samplers, (sampler) => sampler.name)
  }
  async getModels() {
    const models = await webui.getSdModels()
    this.models = map(models, (model) => model.title)
  }
  async waitForReady() {
    await webui.waitForReady()
    await this.getOptions()
    await this.getModels()
    await this.getSamplers()
    runInAction(() => (this.isReady = true))
    this.doCreateTask()
  }
  setUi(key, val) {
    this.ui[key] = val
    this.setStore('ui', this.ui)
  }
  setTxt2ImgOptions(key, val) {
    this.txt2imgOptions[key] = val
    this.setStore('txt2imgOptions', this.txt2imgOptions)
  }
  async setOptions(key, val) {
    const { options } = this
    options[key] = val
    if (key === 'model') {
      this.isReady = false
      this.waitForReady()
      await webui.setOptions({
        sd_model_checkpoint: options.model,
      })
    }
  }
  async createTask() {
    const image = new Task(clone(this.txt2imgOptions))
    this.tasks.push(image)
    this.doCreateTask()
  }
  doCreateTask() {
    if (!this.isReady) {
      return
    }
    const task = this.tasks[0]
    if (task) {
      switch (task.status) {
        case TaskStatus.Complete:
          this.tasks.shift()
          this.doCreateTask()
          break
        case TaskStatus.Wait:
          task.on('complete', (images) => {
            this.images.push(...images)
            if (!this.selectedImage) {
              this.selectImage(images[0])
            }
            this.doCreateTask()
          })
          task.run()
          break
        case TaskStatus.Generating:
          break
      }
    }
  }
}

export default new Store()
