import { makeObservable } from 'mobx'
import { Settings } from '../store/settings'

class Store {
  settings = new Settings()
  constructor() {
    makeObservable(this, {})
  }
}

export default new Store()
