import { action, makeObservable, observable, reaction, runInAction } from 'mobx'
import { VivyFile } from '../../lib/vivyFile'
import { t } from '../../lib/util'
import { IImage } from './types'
import isEmpty from 'licia/isEmpty'
import each from 'licia/each'
import swap from 'licia/swap'
import remove from 'licia/remove'
import idxOf from 'licia/idxOf'
import hotkey from 'licia/hotkey'

export class Project {
  path = ''
  isSave = true
  selectedImage?: IImage
  images: IImage[] = []
  private isLoading = false
  private vivyFile: VivyFile | null = null
  constructor() {
    makeObservable(this, {
      path: observable,
      isSave: observable,
      images: observable,
      selectedImage: observable,
      setPath: action,
      addImage: action,
    })

    this.bindEvent()

    this.load()
  }
  async load() {
    const path = await main.getMainStore('projectPath')
    if (path && node.existsSync(path)) {
      this.open(path)
    } else {
      this.new()
    }
  }
  selectImage(image?: IImage) {
    this.selectedImage = image
  }
  selectPrevImage = () => {
    const { selectedImage, images } = this

    if (!selectedImage) {
      return
    }

    const idx = images.indexOf(selectedImage)
    let nextIdx = idx - 1
    if (nextIdx < 0) {
      nextIdx = images.length - 1
    }
    this.selectImage(images[nextIdx])
  }
  selectNextImage = () => {
    const { selectedImage, images } = this

    if (!selectedImage) {
      return
    }

    const idx = images.indexOf(selectedImage)
    let nextIdx = idx + 1
    if (nextIdx >= images.length) {
      nextIdx = 0
    }
    this.selectImage(images[nextIdx])
  }
  moveImageLeft() {
    const { selectedImage, images } = this

    if (!selectedImage) {
      return
    }

    const idx = images.indexOf(selectedImage)
    if (idx === 0) {
      return
    }

    swap(images, idx - 1, idx)
  }
  moveImageRight() {
    const { selectedImage, images } = this

    if (!selectedImage) {
      return
    }

    const idx = images.indexOf(selectedImage)
    if (idx === images.length - 1) {
      return
    }

    swap(images, idx, idx + 1)
  }
  deleteImage(image: IImage) {
    const { images, selectedImage } = this
    if (image === selectedImage) {
      let idx = idxOf(images, selectedImage) + 1
      if (idx === images.length) {
        idx -= 2
      }
      this.selectImage(images[idx])
    }
    remove(images, (item: IImage) => item === image)
  }
  getImage(id: string) {
    const { images } = this

    for (let i = 0, len = images.length; i < len; i++) {
      const image = images[i]
      if (image.id === id) {
        return image
      }
    }
  }
  deleteAllImages() {
    this.selectImage()
    this.images = []
  }
  addImage(image: IImage) {
    this.images = [...this.images, image]
  }
  setPath(path: string) {
    this.path = path
    main.setMainStore('projectPath', path)
  }
  new() {
    this.setPath('')
    this.vivyFile = VivyFile.create()
  }
  async open(path: string) {
    this.isLoading = true

    this.setPath(path)
    const data = await node.readFile(path)
    this.vivyFile = VivyFile.decode(data)

    const json = this.vivyFile.toJSON()
    const { images } = json
    if (!isEmpty(images)) {
      runInAction(() => {
        this.images = images
      })
    }

    this.isLoading = false
  }
  async save() {
    if (!this.path) {
      const { canceled, filePath } = await main.showSaveDialog({
        defaultPath: `${t('untitled')}.vivy`,
      })
      if (canceled) {
        return
      }
      this.setPath(filePath)
    }

    const vivyFile = this.vivyFile!

    vivyFile.images = []
    each(this.images, (image) => {
      vivyFile.images.push(image)
    })

    const data = VivyFile.encode(vivyFile).finish()
    await node.writeFile(this.path, data, 'utf8')
    runInAction(() => {
      this.isSave = true
    })
  }
  private bindEvent() {
    main.on('saveProject', () => this.save())

    hotkey.on('left', this.selectPrevImage)
    hotkey.on('right', this.selectNextImage)
    hotkey.on('delete', () => {
      if (this.selectedImage) {
        this.deleteImage(this.selectedImage)
      }
    })

    reaction(
      () => {
        return {
          images: this.images,
        }
      },
      () => {
        runInAction(() => {
          if (!this.isLoading) {
            this.isSave = false
          }
        })
      }
    )
  }
}
