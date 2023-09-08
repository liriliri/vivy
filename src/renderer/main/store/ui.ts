import { action, makeObservable, observable } from 'mobx'
import extend from 'licia/extend'

export class UI {
  imageListHeight = 181
  imageListItemSize = 112
  imageListMaximized = false
  imageViewerMaximized = false
  sidebarWidth = 400
  sidebarCollapsed = false
  constructor() {
    makeObservable(this, {
      imageListHeight: observable,
      imageListItemSize: observable,
      imageListMaximized: observable,
      imageViewerMaximized: observable,
      sidebarWidth: observable,
      sidebarCollapsed: observable,
      set: action,
      toggle: action,
    })

    this.load()
  }
  async load() {
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
    })
  }
  toggle(key) {
    this.set(key, !this[key])
  }
}
