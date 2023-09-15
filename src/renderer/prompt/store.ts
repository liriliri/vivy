import { makeObservable, observable } from 'mobx'
import { Settings } from '../store/settings'

class Store {
  settings = new Settings()
  prompt = ''
  constructor() {
    makeObservable(this, {
      settings: observable,
    })
  }
}

export default new Store()
