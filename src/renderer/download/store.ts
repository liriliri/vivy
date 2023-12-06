import { makeObservable, observable } from 'mobx'

interface IDownload {
  id: string
  url: string
  fileName: string
  speed: number
  totalBytes: number
  receivedBytes: number
}

class Store {
  downloads: IDownload[] = []
  constructor() {
    makeObservable(this, {
      downloads: observable,
    })

    this.bindEvent()
  }
  private bindEvent() {
    main.on('addDownload', (event, download) => {
      this.downloads.push(download)
    })
  }
}

export default new Store()
