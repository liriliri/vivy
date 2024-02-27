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
import filter from 'licia/filter'
import base64 from 'licia/base64'
import contain from 'licia/contain'
import remove from 'licia/remove'
import map from 'licia/map'
import convertBin from 'licia/convertBin'
import isFile from 'licia/isFile'
import idxOf from 'licia/idxOf'
import extend from 'licia/extend'
import each from 'licia/each'
import * as webui from '../../lib/webui'
import { ISDGenData, IImageGenData, parseImage } from '../../lib/genData'
import { IImage, IGenOptions, IUpscaleImgOptions } from './types'
import { Task, TaskStatus, GenTask, UpscaleImgTask } from './task'
import fileType from 'licia/fileType'
import { UI } from './ui'
import { Settings } from '../../store/settings'
import LunaModal from 'luna-modal'
import { notify, renderImageMask, t, toDataUrl } from '../../lib/util'
import { ModelType } from '../../../common/types'
import isEmpty from 'licia/isEmpty'
import swap from 'licia/swap'
import hotkey from 'licia/hotkey'
import ric from 'licia/ric'
import isStr from 'licia/isStr'
import { VivyFile } from '../../lib/vivyFile'

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
  initImageMask: string | null = null
  initImagePreview: string | null = null
  isReady = false
  models: string[] = []
  samplers: string[] = []
  images: IImage[] = []
  upscalers: string[] = []
  selectedImage?: IImage
  tasks: Task[] = []
  ui = new UI()
  settings = new Settings()
  statusbarDesc = ''
  private vivyFile: VivyFile | null = null
  private projectPath = ''
  constructor() {
    makeObservable(this, {
      prompt: observable,
      negativePrompt: observable,
      initImage: observable,
      initImageMask: observable,
      initImagePreview: observable,
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
      statusbarDesc: observable,
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
  selectPrevImage = () => {
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
  selectNextImage = () => {
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
      const image = {
        id: uuid(),
        data,
        save: true,
        info: {
          size: base64.decode(data).length,
          mime: type.mime,
          width: 0,
          height: 0,
        },
      }
      ric(async () => {
        const imageInfo = await parseImage(data, type.mime)
        const img = this.getImage(image.id)
        runInAction(() => extend(img!.info, imageInfo))
      })
      this.selectImage(image)
      runInAction(() => this.images.push(this.selectedImage!))
    }
  }
  private async renderInitImage() {
    const { initImage, initImageMask } = this

    if (!initImage) {
      this.initImagePreview = null
      return
    }

    const image = toDataUrl(initImage.data, initImage.info.mime)

    if (initImageMask) {
      const preview = await renderImageMask(image, initImageMask)
      runInAction(() => {
        this.initImagePreview = preview
      })
      return
    }

    runInAction(() => {
      this.initImagePreview = image
    })
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
    const initImageMask = await main.getMainStore('initImageMask')
    if (initImageMask) {
      this.initImageMask = initImageMask
    }
    this.renderInitImage()
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

    const projectPath = await main.getMainStore('projectPath')
    if (projectPath && main.existsSync(projectPath)) {
      this.openProject(projectPath)
    } else {
      this.newProject()
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
    const upscalers = filter(await webui.getUpscalers(), (upscaler) => {
      if (!this.settings.enableWebUI) {
        if (
          contain(['SwinIR_4x', 'LDSR', 'ScuNET', 'ScuNET PSNR'], upscaler.name)
        ) {
          return false
        }
      }
      return true
    })
    runInAction(() => {
      this.upscalers = map(upscalers, (upscaler) => upscaler.name)
    })
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
  async createGenTask() {
    if (!(await this.checkModel())) {
      return
    }
    const task = new GenTask(
      this.prompt,
      this.negativePrompt,
      this.initImage ? this.initImage.data : null,
      this.initImageMask,
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
  async setInitImage(data: IImage | Blob | string, mime = '') {
    const { genOptions } = this

    let buf = new ArrayBuffer(0)
    if (isFile(data)) {
      buf = await convertBin.blobToArrBuffer(data)
    } else if (isStr(data)) {
      buf = convertBin(data, 'ArrayBuffer')
    }
    if (buf.byteLength > 0) {
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

    const { info } = this.initImage
    genOptions.width = info.width
    genOptions.height = info.height
    this.setStore('genOptions', this.genOptions)
    this.setStore('initImage', this.initImage)

    this.initImageMask = null
    this.setStore('initImageMask', null)
    this.renderInitImage()

    main.closePainter()
  }
  deleteInitImage() {
    this.initImage = null
    this.setStore('initImage', null)
  }
  newProject() {
    this.setProjectPath('')
    this.vivyFile = VivyFile.create()
  }
  async openProject(projectPath: string) {
    this.setProjectPath(projectPath)
    const data = await main.readFile(projectPath)
    this.vivyFile = VivyFile.decode(data)

    const json = this.vivyFile.toJSON()
    runInAction(() => {
      const { images } = json
      if (!isEmpty(images)) {
        this.images = images
        this.selectImage(this.images[0])
      }
    })
  }
  saveProject = async () => {
    if (!this.projectPath) {
      const { canceled, filePath } = await main.showSaveDialog({
        defaultPath: `${t('untitled')}.vivy`,
      })
      if (canceled) {
        return
      }
      this.setProjectPath(filePath)
    }

    const vivyFile = this.vivyFile!

    vivyFile.images = []
    each(this.images, (image) => {
      vivyFile.images.push(image)
    })

    const data = VivyFile.encode(this.vivyFile!).finish()
    await main.writeFile(this.projectPath, data, 'utf8')
  }
  private setProjectPath = (projectPath: string) => {
    this.projectPath = projectPath
    this.setStore('projectPath', projectPath)
  }
  private bindEvent() {
    main.on('changeMainStore', (_, name, val) => {
      switch (name) {
        case 'prompt':
          runInAction(() => {
            if (this.prompt !== val) {
              this.prompt = val
            }
          })
          break
        case 'initImage':
          runInAction(() => {
            this.initImage = val
          })
          this.renderInitImage()
          break
        case 'initImageMask':
          runInAction(() => {
            this.initImageMask = val
          })
          this.renderInitImage()
          break
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
      switch (type) {
        case ModelType.StableDiffusion:
          this.isReady = false
          this.waitForReady()
          await webui.refreshCheckpoints()
          break
      }
    })

    main.on('saveProject', this.saveProject)

    hotkey.on('left', this.selectPrevImage)
    hotkey.on('right', this.selectNextImage)
    hotkey.on('delete', () => {
      if (this.selectedImage) {
        this.deleteImage(this.selectedImage)
      }
    })
  }
  private async checkModel() {
    if (!this.isReady) {
      return false
    } else if (isEmpty(this.models)) {
      const result = await LunaModal.confirm(t('noModelsConfirm'))
      if (result) {
        main.downloadModel({
          url: 'https://huggingface.co/runwayml/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.safetensors',
          fileName: 'v1-5-pruned-emaonly.safetensors',
          type: ModelType.StableDiffusion,
        })
        main.showDownload()
      } else {
        main.showModel()
      }
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
        case TaskStatus.Success:
        case TaskStatus.Fail:
          this.tasks.shift()
          this.doCreateTask()
          break
        case TaskStatus.Wait:
          task.on('success', (images) => {
            this.images.push(...images)
            if (!this.selectedImage) {
              this.selectImage(images[0])
            }
            this.doCreateTask()
          })
          task.on('fail', () => {
            notify(t('generateErr'))
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
