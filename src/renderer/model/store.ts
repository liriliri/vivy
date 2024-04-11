import { action, makeObservable, observable, runInAction } from 'mobx'
import { ModelType, IModel } from '../../common/types'
import map from 'licia/map'
import dateFormat from 'licia/dateFormat'
import fileSize from 'licia/fileSize'
import clamp from 'licia/clamp'
import isEmpty from 'licia/isEmpty'
import * as webui from '../lib/webui'

class Store {
  selectedType = ModelType.StableDiffusion
  models: IModel[] = []
  data: any[] = []
  selectedModel?: IModel
  previewHeight = 200
  listHeight = 0
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
      previewHeight: observable,
      listHeight: observable,
      data: observable,
      filter: observable,
      setFilter: action,
      selectModel: action,
      selectType: action,
      setPreviewHeight: action,
      updateListHeight: action,
    })

    this.bindEvent()
    this.refresh()

    this.init()

    this.updateListHeight()
  }
  async init() {
    const previewHeight = await main.getModelStore('previewHeight')
    if (previewHeight) {
      this.setPreviewHeight(previewHeight)
    }
  }
  setFilter(filter: string) {
    this.filter = filter
  }
  setPreviewHeight(height: number) {
    this.previewHeight = height
    main.setModelStore('previewHeight', height)

    this.updateListHeight()
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
    } catch (e) {
      // @ts-ignore
    }
  }
  updateListHeight = () => {
    let height = window.innerHeight - 57 - this.previewHeight
    const maxHeight = window.innerHeight - 100
    const minHeight = 145
    height = clamp(height, minHeight, maxHeight)
    this.listHeight = height
  }
  private bindEvent() {
    main.on('refreshModel', this.refresh)

    window.addEventListener('resize', this.updateListHeight)
  }
  private getSdLora(model: IModel) {
    return this.sdLoras.find((lora) => lora.path === model.path)
  }
}

export default new Store()
