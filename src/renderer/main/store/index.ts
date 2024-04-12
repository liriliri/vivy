import { action, makeObservable, observable, runInAction } from 'mobx'
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
import { notify, setMainStore, t } from '../../lib/util'
import { isEmptyMask } from '../lib/util'
import { ModelType } from '../../../common/types'
import isEmpty from 'licia/isEmpty'
import { Project } from './project'
import BaseStore from '../../store/BaseStore'

interface IOptions {
  model: string
  vae: string
}

class Store extends BaseStore {
  options: IOptions = {
    model: '',
    vae: 'None',
  }
  isWebUIReady = false
  isWebUIErr = false
  models: string[] = []
  vaes: string[] = []
  upscalers: string[] = []
  tasks: Task[] = []
  statusbarDesc = ''
  ui = new UI()
  settings = new Settings()
  project = new Project()
  constructor() {
    super()

    makeObservable(this, {
      isWebUIReady: observable,
      isWebUIErr: observable,
      tasks: observable,
      models: observable,
      vaes: observable,
      upscalers: observable,
      options: observable,
      ui: observable,
      settings: observable,
      project: observable,
      statusbarDesc: observable,
      doCreateTask: action,
      setStatus: action,
    })

    this.init()
    this.bindEvent()
  }
  async init() {
    const upscalers = await main.getMainStore('upscalers')
    if (upscalers) {
      runInAction(() => (this.upscalers = upscalers))
    }

    const ready = await webui.wait()
    if (ready) {
      runInAction(() => {
        this.isWebUIReady = true
      })
      await this.settings.getDevices()
      await this.project.fetchSamplers()
      await this.fetchOptions()
      await this.fetchModels()
      await this.fetchVaes()
      await this.fetchUpscalers()
    } else {
      this.showWebUIErr()
    }
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
        vae: options.sd_vae,
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
    setMainStore('upscalers', this.upscalers)
  }
  async fetchModels() {
    const models = await webui.getSdModels()
    runInAction(() => {
      this.models = map(models, (model) => model.title)
    })
  }
  async fetchVaes() {
    const vaes = await webui.getSdVaes()
    runInAction(() => {
      this.vaes = map(vaes, (vae) => vae.model_name)
    })
  }
  setStatus(status: string) {
    this.statusbarDesc = status
  }
  async setOptions(key, val) {
    const { options } = this
    runInAction(() => {
      options[key] = val
      this.isWebUIReady = false
    })
    if (key === 'model') {
      await webui.setOptions({
        sd_model_checkpoint: options.model,
      })
    } else if (key === 'vae') {
      await webui.setOptions({
        sd_vae: options.vae,
      })
    }
    runInAction(() => {
      this.isWebUIReady = true
    })
  }
  async createGenTask() {
    const { project } = this

    if (!(await this.checkModel())) {
      return
    }

    if (project.initImageMask && (await isEmptyMask(project.initImageMask))) {
      project.deleteInitImageMask()
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
    if (!this.isWebUIReady) {
      return
    }

    const task = new UpscaleImgTask(options)
    this.tasks = [...this.tasks, task]
    this.doCreateTask()
  }
  doCreateTask() {
    const { project } = this

    if (!this.isWebUIReady) {
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
      if (!isEmpty(this.tasks)) {
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
          await webui.refreshCheckpoints()
          await this.fetchModels()
          await this.fetchOptions()
          break
      }
    })

    main.on('webUIError', this.showWebUIErr)

    main.on('setModel', async (_, model) => {
      if (!isEmpty(this.tasks)) {
        return
      }
      await this.setOptions('model', model)
    })

    main.on('setVae', async (_, vae) => {
      if (!isEmpty(this.tasks)) {
        return
      }
      await this.setOptions('vae', vae)
    })
  }
  private async checkModel() {
    if (!this.isWebUIReady) {
      return false
    }

    if (isEmpty(this.models)) {
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
  private showWebUIErr = async () => {
    runInAction(() => {
      this.isWebUIReady = false
      this.isWebUIErr = true
    })
    const result = await LunaModal.confirm(t('webUIErrConfirm'))
    if (result) {
      main.showTerminal()
    }
  }
}

export default new Store()
