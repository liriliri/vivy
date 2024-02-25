import { makeObservable, observable, runInAction } from 'mobx'
import { IImage } from '../main/store/types'
import { toDataUrl } from '../lib/util'

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

    this.load()
  }
  async load() {
    const initImage: IImage = await main.getMainStore('initImage')
    runInAction(() => {
      this.initImage = initImage
      this.image = toDataUrl(initImage.data, initImage.info.mime)
    })

    const mask = await main.getMainStore('initImageMask')
    if (mask) {
      runInAction(() => (this.mask = toDataUrl(mask, 'image/png')))
    }

    this.isLoaded = true
  }
  setMask(mask: string) {
    if (this.isLoaded) {
      main.setMainStore('initImageMask', mask)
    }
  }
}

export default new Store()
