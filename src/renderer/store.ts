import { action, makeObservable, observable, runInAction } from 'mobx'
import clone from 'licia/clone'
import uuid from 'licia/uuid'
import Emitter from 'licia/Emitter'
import map from 'licia/map'
import * as webui from './lib/webui'

enum TaskStatus {
  Wait,
  Generating,
  Complete,
}

interface IImage {
  id: string
  data: string
}

class Task extends Emitter {
  id = uuid()
  status = TaskStatus.Wait
  images: IImage[] = []
  progress = 0
  txt2imgOptions: ITxt2ImgOptions
  constructor(txt2imgOptions: ITxt2ImgOptions) {
    super()

    makeObservable(this, {
      images: observable,
      progress: observable,
      getProgress: action,
      run: action,
    })

    this.txt2imgOptions = txt2imgOptions
    for (let i = 0; i < txt2imgOptions.batchSize; i++) {
      this.images[i] = {
        id: uuid(),
        data: '',
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
    })
    this.progress = 100
    this.status = TaskStatus.Complete
    this.emit('complete')
    for (let i = 0; i < txt2imgOptions.batchSize; i++) {
      this.images[i].data = `data:image/png;base64,${result.images[i]}`
    }
  }
  async getProgress() {
    const result = await webui.getProgress()
    const progress = result.progress

    runInAction(() => {
      this.progress = Math.round(progress * 100)
    })

    if (this.status !== TaskStatus.Complete) {
      setTimeout(() => this.getProgress(), 1000)
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
    prompt: 'a photograph of an astronaut riding a horse',
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
  selectedImage?: IImage
  tasks: Task[] = []
  taskQueue: Task[] = []
  constructor() {
    makeObservable(this, {
      txt2imgOptions: observable,
      isReady: observable,
      tasks: observable,
      models: observable,
      samplers: observable,
      options: observable,
      selectedImage: observable,
      waitForReady: action,
      setTxt2ImgOptions: action,
      createTask: action,
      selectImage: action,
    })

    this.waitForReady()
  }
  selectImage(image: IImage) {
    this.selectedImage = image
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
  setTxt2ImgOptions(key, val) {
    this.txt2imgOptions[key] = val
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
    this.taskQueue.push(image)
    this.doCreateTask()
  }
  doCreateTask() {
    if (!this.isReady) {
      return
    }
    const task = this.taskQueue[0]
    if (task) {
      switch (task.status) {
        case TaskStatus.Complete:
          this.taskQueue.shift()
          this.doCreateTask()
          break
        case TaskStatus.Wait:
          task.on('complete', () => this.doCreateTask())
          task.run()
          break
        case TaskStatus.Generating:
          break
      }
    }
  }
}

export default new Store()
