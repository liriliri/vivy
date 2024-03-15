import { action, makeObservable, observable, runInAction } from 'mobx'
import { ModelType, IModel } from '../../common/types'
import map from 'licia/map'
import dateFormat from 'licia/dateFormat'
import fileSize from 'licia/fileSize'

class Store {
  selectedType = ModelType.StableDiffusion
  models: IModel[] = []
  data: any[] = []
  selectedModel?: IModel
  previewHeight = 200
  listHeight = 0
  constructor() {
    makeObservable(this, {
      selectedType: observable,
      models: observable,
      selectedModel: observable,
      previewHeight: observable,
      listHeight: observable,
      data: observable,
      selectModel: action,
      selectType: action,
      setPreviewHeight: action,
      updateListHeight: action,
    })

    this.bindEvent()
    this.refresh()

    this.load()

    this.updateListHeight()
  }
  async load() {
    const previewHeight = await main.getModelStore('previewHeight')
    if (previewHeight) {
      this.setPreviewHeight(previewHeight)
    }
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
  }
  updateListHeight = () => {
    let height = window.innerHeight - 57 - this.previewHeight
    const maxHeight = window.innerHeight - 100
    const minHeight = 145
    if (height > maxHeight) {
      height = maxHeight
    } else if (height < minHeight) {
      height = minHeight
    }
    this.listHeight = height
  }
  private bindEvent() {
    main.on('refreshModel', this.refresh)

    window.addEventListener('resize', this.updateListHeight)
  }
}

export default new Store()
