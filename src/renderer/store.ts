import { action, makeObservable, observable, runInAction } from 'mobx'
import clone from 'licia/clone'
import uuid from 'licia/uuid'
import Emitter from 'licia/Emitter'
import * as easyDiffusion from './lib/easyDiffusion'
import webui from './lib/webui'

enum ImageStatus {
  Wait,
  Generating,
  Complete,
}

class Image extends Emitter {
  id = uuid()
  data = ''
  status = ImageStatus.Wait
  progress = 0
  generateSetting: IGenerateSetting
  constructor(generateSetting: IGenerateSetting) {
    super()

    makeObservable(this, {
      data: observable,
      progress: observable,
      getProgress: action,
      generate: action,
    })

    this.generateSetting = generateSetting
  }
  async generate() {
    this.status = ImageStatus.Generating
    const result = await easyDiffusion.generateImage(this.generateSetting)
    this.id = result.task

    this.getProgress()
  }
  async getProgress() {
    const result = await easyDiffusion.getImageProgress(this.id)

    if (result.total_steps) {
      runInAction(() => {
        this.progress = Math.round((result.step / result.total_steps) * 100)
      })
    }

    if (result.status === 'succeeded') {
      runInAction(() => {
        this.data = result.output[0].data
        this.status = ImageStatus.Complete
      })
      this.emit('complete')
    } else {
      setTimeout(() => this.getProgress(), 1000)
    }
  }
}

class Store {
  generateSetting: IGenerateSetting = {
    prompt: 'a photograph of an astronaut riding a horse',
    negativePrompt: '',
    model: '',
    sampler: 'euler',
    inferenceSteps: 35,
    seed: -1,
    width: 512,
    height: 512,
  }
  isReady = false
  models: string[] = []
  currentImage?: Image
  images: Image[] = []
  imageQueue: Image[] = []
  constructor() {
    makeObservable(this, {
      generateSetting: observable,
      isReady: observable,
      images: observable,
      currentImage: observable,
      checkHealth: action,
      updateGenerateSetting: action,
      generateImage: action,
      selectImage: action,
    })

    // this.checkHealth()
    // setInterval(() => this.checkHealth(), 5000)
  }
  selectImage(image: Image) {
    this.currentImage = image
  }
  async checkHealth() {
    await webui.waitForReady()
    try {
      const result = await easyDiffusion.ping()
      if (result.status === 'Online') {
        runInAction(() => (this.isReady = true))
        this.doGenerateImage()
      }
    } catch (e) {
      runInAction(() => (this.isReady = false))
    }
  }
  updateGenerateSetting(key, val) {
    this.generateSetting[key] = val
  }
  async generateImage() {
    const image = new Image(clone(this.generateSetting))
    this.images.push(image)
    this.imageQueue.push(image)
    this.doGenerateImage()
  }
  async doGenerateImage() {
    if (!this.isReady) {
      return
    }
    const image = this.imageQueue.shift()
    if (image) {
      switch (image.status) {
        case ImageStatus.Complete:
          this.doGenerateImage()
          break
        case ImageStatus.Wait:
          image.on('complete', () => this.doGenerateImage())
          await image.generate()
          break
        case ImageStatus.Generating:
          break
      }
    }
  }
}

export default new Store()
