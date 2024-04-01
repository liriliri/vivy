import { action, makeObservable, observable } from 'mobx'
import extend from 'licia/extend'

export class UI {
  imageListHeight = 181
  imageListItemSize = 112
  imageListMaximized = false
  imageViewerMaximized = false
  sidebarWidth = 400
  sidebarCollapsed = false
  initImageHeight = 150
  constructor() {
    makeObservable(this, {
      imageListHeight: observable,
      imageListItemSize: observable,
      imageListMaximized: observable,
      imageViewerMaximized: observable,
      sidebarWidth: observable,
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

    await main.setMainStore('ui', {
      imageListHeight: this.imageListHeight,
      imageListItemSize: this.imageListItemSize,
      imageListMaximized: this.imageListMaximized,
      imageViewerMaximized: this.imageViewerMaximized,
      sidebarWidth: this.sidebarWidth,
      sidebarCollapsed: this.sidebarCollapsed,
      initImageHeight: this.initImageHeight,
    })
  }
  toggle(key) {
    this.set(key, !this[key])
  }
}
