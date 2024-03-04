import { action, makeObservable, observable, runInAction } from 'mobx'
import { ModelType, IModel } from '../../common/types'

class Store {
  selectedType = ModelType.StableDiffusion
  models: IModel[] = []
  selectedModel?: string
  constructor() {
    makeObservable(this, {
      selectedType: observable,
      models: observable,
      selectedModel: observable,
      selectModel: action,
      selectType: action,
    })

    this.bindEvent()
    this.refresh()
  }
  selectType(type: ModelType) {
    this.selectedType = type
    this.refresh()
  }
  selectModel(model?: string) {
    this.selectedModel = model
  }
  refresh = async () => {
    const models = await main.getModels(this.selectedType)
    runInAction(() => (this.models = models))
  }
  private bindEvent() {
    main.on('refreshModel', this.refresh)
  }
}

export default new Store()
