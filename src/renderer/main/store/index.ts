import {
  action,
  isObservable,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from 'mobx'
import clone from 'licia/clone'
import filter from 'licia/filter'
import contain from 'licia/contain'
import map from 'licia/map'
import each from 'licia/each'
import * as webui from '../../lib/webui'
import { IImage, IUpscaleImgOptions } from './types'
import { Task, TaskStatus, GenTask, UpscaleImgTask } from './task'
import { UI } from './ui'
import { Settings } from '../../store/settings'
import LunaModal from 'luna-modal'
import { notify, t } from '../../lib/util'
import { ModelType } from '../../../common/types'
import isEmpty from 'licia/isEmpty'
import { Project } from './project'

interface IOptions {
  model: string
}

class Store {
  options: IOptions = {
    model: '',
  }
  isReady = false
  models: string[] = []
  upscalers: string[] = []
  tasks: Task[] = []
  statusbarDesc = ''
  ui = new UI()
  settings = new Settings()
  project = new Project()
  constructor() {
    makeObservable(this, {
      isReady: observable,
      tasks: observable,
      models: observable,
      upscalers: observable,
      options: observable,
      ui: observable,
      settings: observable,
      project: observable,
      statusbarDesc: observable,
      waitForReady: action,
      doCreateTask: action,
      setOptions: action,
      setStatus: action,
    })
    this.load()

    this.bindEvent()

    this.waitForReady()
  }
  async load() {
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
    await this.fetchUpscalers()
    runInAction(() => (this.isReady = true))
    this.doCreateTask()
  }
  setStatus(status: string) {
    this.statusbarDesc = status
  }
  setOptions(key, val) {
    const { options } = this
    options[key] = val
    if (key === 'model') {
      this.isReady = false
      this.waitForReady()
      webui.setOptions({
        sd_model_checkpoint: options.model,
      })
    }
  }
  async createGenTask() {
    const { project } = this

    if (!(await this.checkModel())) {
      return
    }
    const task = new GenTask(
      project.prompt,
      project.negativePrompt,
      project.initImage ? project.initImage.data : null,
      project.initImageMask,
      clone(project.genOptions)
    )
    runInAction(() => {
      this.tasks = [...this.tasks, task]
    })
    this.doCreateTask()
  }
  async createUpscaleImgTask(options: IUpscaleImgOptions) {
    const task = new UpscaleImgTask(options)
    this.tasks = [...this.tasks, task]
    this.doCreateTask()
  }
  doCreateTask() {
    const { project } = this

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
            each(images, (image: IImage) => project.addImage(image))
            if (!this.project.selectedImage) {
              project.selectImage(images[0])
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
  private bindEvent() {
    main.on('closeMain', async () => {
      if (!isEmpty(this.tasks.length)) {
        const result = await LunaModal.confirm(t('quitTaskConfirm'))
        if (!result) {
          return
        }
      }

      if (!(await this.project.checkClose(t('quitUnsaveConfirm')))) {
        return
      }

      main.quitApp()
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
}

export default new Store()
