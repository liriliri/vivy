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

class Task extends Emitter {
  id = uuid()
  status = TaskStatus.Wait
  images: string[] = []
  progress = 0
  generateSetting: IGenerateSetting
  constructor(generateSetting: IGenerateSetting) {
    super()

    makeObservable(this, {
      images: observable,
      progress: observable,
      getProgress: action,
      generate: action,
    })

    this.generateSetting = generateSetting
  }
  async generate() {
    const { generateSetting } = this
    this.status = TaskStatus.Generating
    const result = await webui.txt2img({
      prompt: generateSetting.prompt,
      negative_prompt: generateSetting.negativePrompt,
      batch_size: generateSetting.batchSize,
    })
    this.images = result.images

    // this.getProgress()
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
        this.status = TaskStatus.Complete
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
  tasks: Task[] = []
  taskQueue: Task[] = []
  constructor() {
    makeObservable(this, {
      generateSetting: observable,
      isReady: observable,
      tasks: observable,
      currentImage: observable,
      checkReady: action,
      updateGenerateSetting: action,
      createTask: action,
      selectImage: action,
    })

    this.checkReady()
  }
  selectImage(image: Image) {
    this.currentImage = image
  }
  async checkReady() {
    await webui.waitForReady()
    runInAction(() => (this.isReady = true))
    this.doCreateTask()
  }
  updateGenerateSetting(key, val) {
    this.generateSetting[key] = val
  }
  async createTask() {
    const image = new Task(clone(this.generateSetting))
    this.tasks.push(image)
    this.taskQueue.push(image)
    this.doCreateTask()
  }
  async doCreateTask() {
    if (!this.isReady) {
      return
    }
    const task = this.taskQueue.shift()
    if (task) {
      switch (task.status) {
        case TaskStatus.Complete:
          this.doCreateTask()
          break
        case TaskStatus.Wait:
          task.on('complete', () => this.doCreateTask())
          await task.generate()
          break
        case TaskStatus.Generating:
          break
      }
    }
  }
}

export default new Store()
