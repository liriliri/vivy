import { makeObservable, observable, runInAction } from 'mobx'
import { IImage } from '../main/store/types'
import { setMemStore, toDataUrl } from '../lib/util'

class Store {
  image = ''
  mask = ''
  initImage: IImage | null = null
  private isLoaded = false
  constructor() {
    makeObservable(this, {
      image: observable,
      mask: observable,
    })

    this.init()
  }
  async init() {
    const initImage: IImage = await main.getMemStore('initImage')
    runInAction(() => {
      this.initImage = initImage
      this.image = toDataUrl(initImage.data, initImage.info.mime)
    })

    const mask = await main.getMemStore('initImageMask')
    if (mask) {
      runInAction(() => (this.mask = toDataUrl(mask, 'image/png')))
    }

    this.isLoaded = true
  }
  setMask(mask: string) {
    if (this.isLoaded) {
      setMemStore('initImageMask', mask)
    }
  }
}

export default new Store()
