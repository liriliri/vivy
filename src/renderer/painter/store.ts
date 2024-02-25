import { makeObservable, observable, runInAction } from 'mobx'
import { IImage } from '../main/store/types'
import { toDataUrl } from '../lib/util'

class Store {
  image =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII'
  initImage: IImage | null = null
  constructor() {
    makeObservable(this, {
      image: observable,
    })

    this.load()
  }
  async load() {
    const initImage: IImage = await main.getMainStore('initImage')
    runInAction(() => {
      this.initImage = initImage
      this.image = toDataUrl(initImage.data, initImage.info.mime)
    })
  }
}

export default new Store()
