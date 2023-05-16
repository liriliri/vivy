import { action, makeObservable, observable, runInAction } from 'mobx'
import clone from 'licia/clone'
import uuid from 'licia/uuid'
import Emitter from 'licia/Emitter'
import * as easyDiffusion from './lib/easyDiffusion'
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
    const result = await webui.txt2img(txt2imgOptions)
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

class Store {
  txt2imgOptions: ITxt2ImgOptions = {
    prompt: 'a photograph of an astronaut riding a horse',
    negativePrompt: '',
    model: '',
    sampler: 'Euler a',
    steps: 35,
    seed: -1,
    width: 512,
    height: 512,
    batchSize: 1,
  }
  isReady = false
  models: string[] = []
  currentImage?: IImage
  tasks: Task[] = []
  taskQueue: Task[] = []
  constructor() {
    makeObservable(this, {
      txt2imgOptions: observable,
      isReady: observable,
      tasks: observable,
      currentImage: observable,
      checkReady: action,
      updateTxt2ImgOptions: action,
      createTask: action,
      selectImage: action,
    })

    this.checkReady()
  }
  selectImage(image: IImage) {
    this.currentImage = image
  }
  async checkReady() {
    await webui.waitForReady()
    runInAction(() => (this.isReady = true))
    this.doCreateTask()
  }
  updateTxt2ImgOptions(key, val) {
    this.txt2imgOptions[key] = val
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
