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

    this.bindEvent()
    this.refresh()
  }
  selectType(type: ModelType) {
    this.type = type
    this.refresh()
  }
  refresh = async () => {
    this.models = await main.getModels(this.type)
  }
  private bindEvent() {
    main.on('refreshModel', this.refresh)
  }
}

export default new Store()
