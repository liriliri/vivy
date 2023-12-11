import { makeObservable, observable, runInAction } from 'mobx'
import remove from 'licia/remove'
import { ModelType } from '../../common/types'

interface IDownload {
  id: string
  url: string
  state: string
  fileName: string
  speed: number
  totalBytes: number
  receivedBytes: number
  paused: boolean
  path: string
  type: ModelType
}

class Store {
  downloads: IDownload[] = []
  constructor() {
    makeObservable(this, {
      downloads: observable,
    })

    this.bindEvent()
    this.load()
  }
  async load() {
    const downloads = await main.getDownloads()
    runInAction(() => {
      this.downloads = downloads
    })
  }
  private bindEvent() {
    main.on('addDownload', (event, download) => {
      runInAction(() => {
        this.downloads.push(download)
      })
    })
    main.on('updateDownload', (event, download) => {
      const { downloads } = this
      const { id } = download
      for (let i = 0, len = downloads.length; i < len; i++) {
        if (downloads[i].id === id) {
          runInAction(() => {
            downloads[i] = download
          })
          break
        }
      }
    })
    main.on('deleteDownload', (event, id) => {
      runInAction(() => {
        remove(this.downloads, (download) => download.id === id)
      })
    })
  }
}

export default new Store()
