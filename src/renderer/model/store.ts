import { makeObservable, observable } from 'mobx'
import { ModelType, IModel } from '../../common/types'

class Store {
  type = ModelType.StableDiffusion
  models: IModel[] = []
  constructor() {
    makeObservable(this, {
      type: observable,
      models: observable,
    })
    this.refresh()
  }
  selectType(type: ModelType) {
    this.type = type
    this.refresh()
  }
  async refresh() {
    this.models = await main.getModels(this.type)
  }
}

export default new Store()
