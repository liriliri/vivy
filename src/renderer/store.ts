import { makeAutoObservable } from 'mobx'
import * as request from './lib/request'

interface IGenerateSetting {
  prompt: string
  sampler: string
  seed: number
  width: number
  height: number
  inferenceSteps: number
  model: string
}

class Image {
  id = ''
  data = ''
  progress = 0
  constructor(id: string) {
    this.id = id
    this.getProgress()
  }
  async getProgress() {
    const result = await request.getImageProgress(this.id)

    if (result.total_steps) {
      this.progress = Math.round((result.step / result.total_steps) * 100)
    }

    if (result.status === 'succeeded') {
      this.data = result.output[0].data
      console.log(this.data)
    } else {
      setTimeout(() => this.getProgress(), 1000)
    }
  }
}

class Store {
  generateSetting: IGenerateSetting = {
    prompt: 'a photograph of an astronaut riding a horse',
    model: '',
    sampler: 'euler',
    inferenceSteps: 35,
    seed: -1,
    width: 512,
    height: 512,
  }
  isReady = false
  models: string[] = []
  images: Image[] = []
  constructor() {
    makeAutoObservable(this)

    this.checkHealth()
    setInterval(() => this.checkHealth(), 5000)
  }
  async checkHealth() {
    try {
      const result = await request.ping()
      if (result.status === 'Online') {
        this.isReady = true
      }
    } catch (e) {
      this.isReady = false
    }
  }
  updateGenerateSetting(key, val) {
    this.generateSetting[key] = val
  }
  async generateImage() {
    const result = await request.generateImage(this.generateSetting)
    this.images.push(new Image(result.task))
  }
}

export default new Store()
