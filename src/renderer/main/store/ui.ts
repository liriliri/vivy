import { action, makeObservable, observable } from 'mobx'
import extend from 'licia/extend'
import { setMainStore } from '../../lib/util'
import { IImage } from './types'

export class UI {
  imageListWeight = 30
  imageListItemSize = 112
  imageListMaximized = false
  imageViewerMaximized = false
  sidebarWeight = 30
  sidebarCollapsed = false
  initImageHeight = 150
  constructor() {
    makeObservable(this, {
      imageListWeight: observable,
      imageListItemSize: observable,
      imageListMaximized: observable,
      imageViewerMaximized: observable,
      sidebarWeight: observable,
      sidebarCollapsed: observable,
      initImageHeight: observable,
      set: action,
      toggle: action,
    })

    this.init()
  }
  async init() {
    const ui = await main.getMainStore('ui')
    if (ui) {
      extend(this, ui)
    }
  }
  async set(key, val) {
    this[key] = val

    await setMainStore('ui', {
      imageListWeight: this.imageListWeight,
      imageListItemSize: this.imageListItemSize,
      imageListMaximized: this.imageListMaximized,
      imageViewerMaximized: this.imageViewerMaximized,
      sidebarWeight: this.sidebarWeight,
      sidebarCollapsed: this.sidebarCollapsed,
      initImageHeight: this.initImageHeight,
    })
  }
  toggle(key) {
    this.set(key, !this[key])
  }
}

export class ImageModal {
  visible = false
  image: IImage | null = null
  constructor() {
    makeObservable(this, {
      visible: observable,
      image: observable,
      show: action,
      close: action,
    })
  }
  show(image: IImage) {
    this.image = image
    this.visible = true
  }
  close() {
    this.visible = false
  }
}
