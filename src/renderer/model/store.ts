import { action, makeObservable, observable, runInAction } from 'mobx'
import { ModelType, IModel } from '../../common/types'
import map from 'licia/map'
import dateFormat from 'licia/dateFormat'
import fileSize from 'licia/fileSize'
import isEmpty from 'licia/isEmpty'
import * as webui from '../lib/webui'
import contain from 'licia/contain'
import * as prompt from '../lib/prompt'

class Store {
  selectedType = ModelType.StableDiffusion
  models: IModel[] = []
  data: any[] = []
  selectedModel?: IModel
  previewWeight = 40
  filter = ''
  sdModels: webui.StableDiffusionModel[] = []
  sdVaes: webui.StableDiffusionVae[] = []
  sdLoras: webui.StableDiffusionLora[] = []
  metadata: any = null
  constructor() {
    makeObservable(this, {
      selectedType: observable,
      models: observable,
      selectedModel: observable,
      previewWeight: observable,
      data: observable,
      filter: observable,
      setFilter: action,
      selectModel: action,
      selectType: action,
      setPreviewWeight: action,
    })

    this.bindEvent()
    this.init()
  }
  async init() {
    const previewWeight = await main.getModelStore('previewWeight')
    if (previewWeight) {
      this.setPreviewWeight(previewWeight)
    }

    await this.refresh()
    if (isEmpty(this.sdModels)) {
      const ready = await webui.wait()
      if (ready) {
        await this.refresh()
      }
    }
  }
  setFilter(filter: string) {
    this.filter = filter
  }
  setPreviewWeight(weight: number) {
    this.previewWeight = weight
    main.setModelStore('previewWeight', weight)
  }
  selectType(type: ModelType) {
    this.selectedType = type
    this.refresh()
  }
  selectModel(model?: IModel) {
    this.selectedModel = model
    let sdLora: webui.StableDiffusionLora | undefined
    if (model && this.selectedType === ModelType.Lora) {
      sdLora = this.getSdLora(model)
    }
    if (sdLora && !isEmpty(sdLora.metadata)) {
      this.metadata = sdLora.metadata
    } else {
      this.metadata = null
    }
  }
  refresh = async () => {
    const models = await main.getModels(this.selectedType)
    runInAction(() => {
      this.models = models
      this.data = map(models, (model: IModel) => {
        return {
          name: model.name,
          size: `${fileSize(model.size)}B`,
          created: dateFormat(
            new Date(model.createdDate),
            'yyyy-mm-dd HH:MM:ss'
          ),
        }
      })
    })

    try {
      switch (this.selectedType) {
        case ModelType.StableDiffusion:
          this.sdModels = await webui.getSdModels()
          break
        case ModelType.Lora:
          this.sdLoras = await webui.getSdLoras()
          break
        case ModelType.VAE:
          this.sdVaes = await webui.getSdVaes()
          break
      }
    } catch {
      // ignore
    }
  }
  apply = async () => {
    if (!this.selectedModel) {
      return
    }

    const model = this.selectedModel
    switch (this.selectedType) {
      case ModelType.StableDiffusion: {
        const sdModel = this.getSdModel(model)
        if (sdModel) {
          main.sendToWindow('main', 'setModel', sdModel.title)
        }
        break
      }
      case ModelType.VAE: {
        const vae = this.getVae(model)
        if (vae) {
          main.sendToWindow('main', 'setVae', vae.model_name)
        }
        break
      }
      case ModelType.Lora: {
        const lora = this.getSdLora(model)
        if (lora) {
          const alias = lora.alias
          const p = (await main.getMemStore('prompt')) || ''
          if (!contain(p, `lora:${alias}`)) {
            await main.setMemStore(
              'prompt',
              prompt.addTag(p, `<lora:${alias}:1>`)
            )
          }
        }
        break
      }
    }
  }
  private bindEvent() {
    main.on('refreshModel', (type: ModelType) => {
      if (type === this.selectedType) {
        this.refresh()
      }
    })
  }
  private getSdLora(model: IModel) {
    return this.sdLoras.find((lora) => lora.path === model.path)
  }
  private getSdModel(model: IModel) {
    return this.sdModels.find((sdModel) => sdModel.filename === model.path)
  }
  private getVae(model: IModel) {
    return this.sdVaes.find((vae) => vae.filename === model.path)
  }
}

export default new Store()
