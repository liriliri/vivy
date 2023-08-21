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
import Emitter from 'licia/Emitter'
import remove from 'licia/remove'
import map from 'licia/map'
import convertBin from 'licia/convertBin'
import openFile from 'licia/openFile'
import idxOf from 'licia/idxOf'
import extend from 'licia/extend'
import * as webui from '../lib/webui'
import { getSystemLanguage, splitImage } from '../lib/util'
import isDarkMode from 'licia/isDarkMode'

export enum TaskStatus {
  Wait,
  Generating,
  Complete,
}

interface IImageInfo {
  prompt?: string
  negativePrompt?: string
}

export interface IImage {
  id: string
  data: string
  info?: IImageInfo
}

class Task extends Emitter {
  id = uuid()
  status = TaskStatus.Wait
  images: IImage[] = []
  progress = 0
  private currentImage: string = ''
  private txt2imgOptions: ITxt2ImgOptions
  private progressTimer?: NodeJS.Timeout
  constructor(txt2imgOptions: ITxt2ImgOptions) {
    super()

    makeObservable(this, {
      images: observable,
      progress: observable,
      status: observable,
      getProgress: action,
      run: action,
    })

    this.txt2imgOptions = txt2imgOptions
    for (let i = 0; i < txt2imgOptions.batchSize; i++) {
      this.images[i] = {
        id: uuid(),
        data: '',
        info: {
          prompt: txt2imgOptions.prompt,
          negativePrompt: txt2imgOptions.negativePrompt,
        },
      }
    }
  }
  async run() {
    const { txt2imgOptions } = this
    this.status = TaskStatus.Generating
    this.getProgress()
    const result = await webui.txt2img({
      prompt: txt2imgOptions.prompt,
      negative_prompt: txt2imgOptions.negativePrompt,
      batch_size: txt2imgOptions.batchSize,
      steps: txt2imgOptions.steps,
      sampler_name: txt2imgOptions.sampler,
      cfg_scale: txt2imgOptions.cfgScale,
      width: txt2imgOptions.width,
      height: txt2imgOptions.height,
    })
    this.progress = 100
    this.status = TaskStatus.Complete
    if (this.progressTimer) {
      clearTimeout(this.progressTimer)
    }
    for (let i = 0; i < txt2imgOptions.batchSize; i++) {
      this.images[i].data = result.images[i]
    }
    this.emit('complete', this.images)
  }
  async getProgress() {
    const { batchSize } = this.txt2imgOptions

    const { current_image, progress } = await webui.getProgress()

    runInAction(() => {
      this.progress = Math.round(progress * 100)
    })

    if (this.status !== TaskStatus.Complete) {
      this.progressTimer = setTimeout(() => this.getProgress(), 1000)
      if (current_image && current_image !== this.currentImage) {
        this.currentImage = current_image
        const images = await splitImage(current_image, batchSize)
        for (let i = 0; i < batchSize; i++) {
          this.images[i].data = images[i]
        }
      }
    }
  }
}

interface ITxt2ImgOptions {
  prompt: string
  negativePrompt: string
  sampler: string
  seed: number
  width: number
  height: number
  steps: number
  batchSize: number
  model: string
  cfgScale: number
}

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
      waitForReady: action,
      setTxt2ImgOptions: action,
      setUi: action,
      createTask: action,
      selectImage: action,
      deleteAllImages: action,
      deleteImage: action,
      openImage: action,
    })
    this.load()

    this.waitForReady()
  }
  selectImage(image?: IImage) {
    this.selectedImage = image
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
  openImage() {
    openFile({
      accept: 'image/png',
    }).then(async (fileList) => {
      const file = fileList[0]
      if (file) {
        const buf = await convertBin.blobToArrBuffer(file)
        const image = {
          id: uuid(),
          data: await convertBin(buf, 'base64'),
        }
        this.selectImage(image)
        this.images.push(this.selectedImage!)
      }
    })
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
  }
  async loadSetting(name: string) {
    const val = await this.getSettings(name)
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
  async getSettings(name: string) {
    return await main.getSettingsStore(name)
  }
  async setSettings(name: string, val: any) {
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
    await webui.setOptions({
      sd_model_checkpoint: options.model,
    })
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
