import { makeObservable, observable } from 'mobx'

interface IDownload {
  id: string
  url: string
  state: string
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
    main.on('updateDownload', (event, download) => {
      const { downloads } = this
      const { id } = download
      for (let i = 0, len = downloads.length; i < len; i++) {
        if (downloads[i].id === id) {
          downloads[i] = download
          break
        }
      }
    })
  }
}

export default new Store()
