import { makeObservable, observable, runInAction } from 'mobx'
import { IImage } from '../main/store/types'
import { setMemStore } from 'share/renderer/lib/util'
import dataUrl from 'licia/dataUrl'

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
      this.image = dataUrl.stringify(initImage.data, initImage.info.mime)
    })

    const mask = await main.getMemStore('initImageMask')
    if (mask) {
      runInAction(() => (this.mask = mask))
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
