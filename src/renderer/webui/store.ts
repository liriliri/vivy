import { makeObservable, observable, runInAction } from 'mobx'
import BaseStore from '../store/BaseStore'
import * as webui from '../lib/webui'

class Store extends BaseStore {
  isWebUIReady = false
  isWebUIErr = false
  webUIUrl = ''
  constructor() {
    super()

    makeObservable(this, {
      isWebUIErr: observable,
      isWebUIReady: observable,
    })

    this.init()
  }
  async init() {
    const webUIPort = await main.getWebUIPort()
    this.webUIUrl = `http://127.0.0.1:${webUIPort}`

    const ready = await webui.wait()
    if (ready) {
      runInAction(() => {
        this.isWebUIReady = true
      })
    } else {
      runInAction(() => {
        this.isWebUIErr = true
      })
    }
  }
}

export default new Store()
