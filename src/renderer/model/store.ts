import { makeObservable, observable } from 'mobx'
import map from 'licia/map'
import * as webui from '../lib/webui'

interface IModel {
  modelName: string
}

class Store {
  models: IModel[] = []
  constructor() {
    makeObservable(this, {
      models: observable,
    })

    this.waitForReady()
  }
  async waitForReady() {
    await webui.waitForReady()
    await this.getModels()
  }
  async getModels() {
    const models = await webui.getSdModels()
    this.models = map(models, (model) => {
      return {
        modelName: model.model_name,
      }
    })
  }
}

export default new Store()
