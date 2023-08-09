import { makeObservable } from 'mobx'

class Store {
  constructor() {
    makeObservable(this, {})
  }
}

export default new Store()
