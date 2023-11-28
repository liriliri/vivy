import {
  action,
  isObservable,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from 'mobx'
import clone from 'licia/clone'
import some from 'licia/some'
import uuid from 'licia/uuid'
import startWith from 'licia/startWith'
import base64 from 'licia/base64'
import contain from 'licia/contain'
import remove from 'licia/remove'
import map from 'licia/map'
import convertBin from 'licia/convertBin'
import isFile from 'licia/isFile'
import idxOf from 'licia/idxOf'
import extend from 'licia/extend'
import * as webui from '../../lib/webui'
import { ISDGenData, IImageGenData, parseImage } from '../../lib/genData'
import { IImage, IGenOptions, IUpscaleImgOptions } from './types'
import { Task, TaskStatus, GenTask, UpscaleImgTask } from './task'
import fileType from 'licia/fileType'
import { UI } from './ui'
import { Settings } from '../../store/settings'
import LunaModal from 'luna-modal'
import { t } from '../../lib/util'
import { ModelType } from '../../../common/types'
import isEmpty from 'licia/isEmpty'
import swap from 'licia/swap'

interface IOptions {
  model: string
}

class Store {
  genOptions: IGenOptions = {
    sampler: 'Euler a',
    steps: 20,
    seed: -1,
    width: 512,
    height: 512,
    batchSize: 2,
    cfgScale: 7,
    denoisingStrength: 0.7,
  }
  options: IOptions = {
    model: '',
  }
  prompt = ''
  negativePrompt = ''
  initImage: IImage | null = null
  isReady = false
  models: string[] = []
  samplers: string[] = []
  images: IImage[] = []
  upscalers: string[] = []
  selectedImage?: IImage
  tasks: Task[] = []
  ui = new UI()
  settings = new Settings()
  constructor() {
    makeObservable(this, {
      prompt: observable,
      negativePrompt: observable,
      initImage: observable,
      genOptions: observable,
      isReady: observable,
      tasks: observable,
      models: observable,
      samplers: observable,
      upscalers: observable,
      images: observable,
      options: observable,
      selectedImage: observable,
      ui: observable,
      settings: observable,
      load: action,
      waitForReady: action,
      setGenOption: action,
      setGenOptions: action,
      createGenTask: action,
      selectImage: action,
      selectNextImage: action,
      selectPrevImage: action,
      moveImageLeft: action,
      moveImageRight: action,
      deleteAllImages: action,
      deleteImage: action,
      addFiles: action,
      setInitImage: action,
      deleteInitImage: action,
    })
    this.load()
    this.bindEvent()

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
  moveImageLeft() {
    const { selectedImage, images } = this

    if (!selectedImage) {
      return
    }

    const idx = images.indexOf(selectedImage)
    if (idx === 0) {
      return
    }

    swap(images, idx - 1, idx)
  }
  moveImageRight() {
    const { selectedImage, images } = this

    if (!selectedImage) {
      return
    }

    const idx = images.indexOf(selectedImage)
    if (idx === images.length - 1) {
      return
    }

    swap(images, idx, idx + 1)
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
  getImage(id: string) {
    const { images } = this

    for (let i = 0, len = images.length; i < len; i++) {
      const image = images[i]
      if (image.id === id) {
        return image
      }
    }
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
      const data = convertBin(buf, 'base64')
      const imageInfo = await parseImage(data, type.mime)
      const image = {
        id: uuid(),
        data,
        save: true,
        info: {
          size: base64.decode(data).length,
          mime: type.mime,
          ...imageInfo,
        },
      }
      this.selectImage(image)
      this.images.push(this.selectedImage!)
    }
  }
  async load() {
    const prompt = (await main.getMainStore('prompt')) || ''
    const negativePrompt = (await main.getMainStore('negativePrompt')) || ''
    runInAction(async () => {
      this.prompt = prompt
      this.negativePrompt = negativePrompt
    })
    const initImage = await main.getMainStore('initImage')
    if (initImage && initImage.info) {
      this.initImage = initImage
    }
    const genOptions = await main.getMainStore('genOptions')
    if (genOptions) {
      runInAction(() => {
        extend(this.genOptions, genOptions)
      })
    }
    const samplers = await main.getMainStore('samplers')
    if (samplers) {
      runInAction(() => (this.samplers = samplers))
    }
    const upscalers = await main.getMainStore('upscalers')
    if (upscalers) {
      runInAction(() => (this.upscalers = upscalers))
    }
  }
  async setStore(name: string, val: any) {
    await main.setMainStore(name, isObservable(val) ? toJS(val) : val)
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
  async fetchOptions() {
    const options = await webui.getOptions()
    runInAction(() => {
      this.options = {
        model: options.sd_model_checkpoint,
      }
    })
  }
  async fetchSamplers() {
    const samplers = await webui.getSamplers()
    runInAction(() => {
      this.samplers = map(samplers, (sampler) => sampler.name)
    })
    this.setStore('samplers', this.samplers)
  }
  async fetchUpscalers() {
    const upscalers = await webui.getUpscalers()
    this.upscalers = map(upscalers, (upscaler) => upscaler.name)
    this.setStore('upscalers', this.upscalers)
  }
  async fetchModels() {
    const models = await webui.getSdModels()
    runInAction(() => {
      this.models = map(models, (model) => model.title)
    })
  }
  async waitForReady() {
    if (isEmpty(this.tasks)) {
      await webui.waitForReady()
    }
    await this.fetchOptions()
    await this.fetchModels()
    await this.fetchSamplers()
    await this.fetchUpscalers()
    runInAction(() => (this.isReady = true))
    this.doCreateTask()
  }
  async setPrompt(prompt: string) {
    if (this.prompt === prompt) {
      return
    }
    this.prompt = prompt
    await this.setStore('prompt', prompt)
  }
  async setNegativePrompt(negativePrompt: string) {
    if (this.negativePrompt === negativePrompt) {
      return
    }
    this.negativePrompt = negativePrompt
    await this.setStore('negativePrompt', negativePrompt)
  }
  setGenOption(key, val) {
    this.genOptions[key] = val
    this.setStore('genOptions', this.genOptions)
  }
  async setGenOptions(genData: ISDGenData | IImageGenData) {
    const { genOptions } = this

    if (genData.prompt) {
      await this.setPrompt(genData.prompt)
    }
    if (genData.negativePrompt) {
      await this.setNegativePrompt(genData.negativePrompt)
    }
    if (genData.sampler && contain(this.samplers, genData.sampler)) {
      genOptions.sampler = genData.sampler
    }
    if (genData.steps) {
      genOptions.steps = genData.steps
    }
    if (genData.width) {
      genOptions.width = genData.width
    }
    if (genData.height) {
      genOptions.height = genData.height
    }
    if (genData.cfgScale) {
      genOptions.cfgScale = genData.cfgScale
    }
    if (genData.seed) {
      genOptions.seed = genData.seed
    }
    await this.setStore('genOptions', genOptions)
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
  bindEvent() {
    main.on('changeMainStore', (_, name, val) => {
      if (name === 'prompt') {
        runInAction(() => {
          if (this.prompt !== val) {
            this.prompt = val
          }
        })
      }
    })

    main.on('closeMain', async () => {
      if (this.tasks.length > 0) {
        const result = await LunaModal.confirm(t('quitTaskConfirm'))
        if (result) {
          main.quitApp()
        }
      } else {
        const imagesNotSaved = some(this.images, (image) => !image.save)
        if (imagesNotSaved) {
          const result = await LunaModal.confirm(t('quitImageConfirm'))
          if (result) {
            main.quitApp()
          }
        } else {
          main.quitApp()
        }
      }
    })

    main.on('refreshModel', async (_, type: ModelType) => {
      if (type === ModelType.StableDiffusion) {
        this.isReady = false
        this.waitForReady()
        await webui.refreshCheckpoints()
      }
    })
  }
  async createGenTask() {
    if (!(await this.checkModel())) {
      return
    }
    const task = new GenTask(
      this.prompt,
      this.negativePrompt,
      this.initImage ? this.initImage.data : null,
      clone(this.genOptions)
    )
    this.tasks.push(task)
    this.doCreateTask()
  }
  async createUpscaleImgTask(options: IUpscaleImgOptions) {
    const task = new UpscaleImgTask(options)
    this.tasks.push(task)
    this.doCreateTask()
  }
  async setInitImage(data: IImage | Blob, mime = '') {
    if (isFile(data)) {
      const buf = await convertBin.blobToArrBuffer(data)
      if (!mime) {
        const type = fileType(buf)
        if (type) {
          mime = type.mime
        }
      }

      if (!startWith(mime, 'image/')) {
        return
      }

      const base64Data = await convertBin(buf, 'base64')
      const imageInfo = await parseImage(base64Data, mime)
      this.initImage = {
        id: uuid(),
        data: base64Data,
        save: true,
        info: {
          size: buf.byteLength,
          mime,
          ...imageInfo,
        },
      }
    } else {
      this.initImage = data as IImage
    }

    this.setStore('initImage', this.initImage)
  }
  deleteInitImage() {
    this.initImage = null
    this.setStore('initImage', null)
  }
  private async checkModel() {
    if (!this.isReady) {
      return false
    } else if (isEmpty(this.models)) {
      await LunaModal.alert(t('noModelsAlert'))
      main.showModel()
      return false
    }

    return true
  }
  private doCreateTask() {
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
