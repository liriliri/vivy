import {
  action,
  isObservable,
  makeObservable,
  observable,
  reaction,
  runInAction,
  toJS,
} from 'mobx'
import { VivyFile } from '../../lib/vivyFile'
import { t, toDataUrl, renderImageMask, notify } from '../../lib/util'
import { IImage, IGenOptions } from './types'
import isEmpty from 'licia/isEmpty'
import each from 'licia/each'
import swap from 'licia/swap'
import remove from 'licia/remove'
import idxOf from 'licia/idxOf'
import hotkey from 'licia/hotkey'
import clone from 'licia/clone'
import extend from 'licia/extend'
import isStr from 'licia/isStr'
import isFile from 'licia/isFile'
import convertBin from 'licia/convertBin'
import uuid from 'licia/uuid'
import startWith from 'licia/startWith'
import base64 from 'licia/base64'
import fileType from 'licia/fileType'
import last from 'licia/last'
import ric from 'licia/ric'
import map from 'licia/map'
import { ISDGenData, IImageGenData, parseImage } from '../../lib/genData'
import contain from 'licia/contain'
import * as webui from '../../lib/webui'
import LunaModal from 'luna-modal'
import splitPath from 'licia/splitPath'

export class Project {
  prompt = ''
  negativePrompt = ''
  path = ''
  isSave = true
  selectedImage?: IImage
  images: IImage[] = []
  initImage: IImage | null = null
  initImageMask: string | null = null
  initImagePreview: string | null = null
  samplers: string[] = []
  genOptions: IGenOptions = clone(defGenOptions)
  private selectedImageIndex = -1
  private vivyFile: VivyFile | null = null
  constructor() {
    makeObservable(this, {
      prompt: observable,
      negativePrompt: observable,
      genOptions: observable,
      path: observable,
      isSave: observable,
      samplers: observable,
      initImage: observable,
      initImageMask: observable,
      initImagePreview: observable,
      images: observable,
      selectedImage: observable,
      setGenOption: action,
      setPath: action,
      addImage: action,
      deleteImage: action,
      setPrompt: action,
      setNegativePrompt: action,
      selectImage: action,
      deleteInitImage: action,
      deleteInitImageMask: action,
      deleteAllImages: action,
      moveImageLeft: action,
      moveImageRight: action,
    })

    this.bindEvent()

    this.init()
  }
  async init() {
    const samplers = await main.getMainStore('samplers')

    if (samplers) {
      runInAction(() => (this.samplers = samplers))
    }

    const path = await main.getMainStore('projectPath')
    if (path && node.existsSync(path)) {
      this.open(path)
    } else {
      this.new()
    }

    await this.fetchSamplers()
  }
  async fetchSamplers() {
    const samplers = await webui.getSamplers()
    runInAction(() => {
      this.samplers = map(samplers, (sampler) => sampler.name)
    })
    this.setStore('samplers', this.samplers)
  }
  setPrompt(prompt: string) {
    if (this.prompt === prompt) {
      return
    }
    this.prompt = prompt
    this.setStore('prompt', prompt)
  }
  setNegativePrompt(negativePrompt: string) {
    if (this.negativePrompt === negativePrompt) {
      return
    }
    this.negativePrompt = negativePrompt
  }
  async addFiles(files: FileList) {
    for (let i = 0, len = files.length; i < len; i++) {
      const file = files[i]
      const buf = await convertBin.blobToArrBuffer(file)
      const type = fileType(buf)
      if (!type || !startWith(type.mime, 'image/')) {
        continue
      }
      const data = convertBin(buf, 'base64')
      const image = {
        id: uuid(),
        data,
        save: true,
        info: {
          size: base64.decode(data).length,
          mime: type.mime,
          width: 0,
          height: 0,
        },
      }
      ric(async () => {
        const imageInfo = await parseImage(data, type.mime)
        const img = this.getImage(image.id)
        runInAction(() => extend(img!.info, imageInfo))
      })
      this.addImage(image)
      this.selectImage(last(this.images))
    }
  }
  setGenOption(key, val) {
    this.genOptions[key] = val
  }
  async setGenOptions(genData: ISDGenData | IImageGenData) {
    if (genData.prompt) {
      await this.setPrompt(genData.prompt)
    }
    if (genData.negativePrompt) {
      await this.setNegativePrompt(genData.negativePrompt)
    }
    if (genData.sampler && contain(this.samplers, genData.sampler)) {
      this.setGenOption('sampler', genData.sampler)
    }
    if (genData.steps) {
      this.setGenOption('steps', genData.steps)
    }
    if (genData.width) {
      this.setGenOption('width', genData.width)
    }
    if (genData.height) {
      this.setGenOption('height', genData.height)
    }
    if (genData.cfgScale) {
      this.setGenOption('cfgScale', genData.cfgScale)
    }
    if (genData.seed) {
      this.setGenOption('seed', genData.seed)
    }
  }
  selectImage(image?: IImage) {
    if (image) {
      const idx = idxOf(this.images, image)
      if (idx > -1) {
        this.selectedImage = image
        this.selectedImageIndex = idx
      }
    } else {
      this.selectedImage = image
      this.selectedImageIndex = -1
    }
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
    this.images = clone(images)
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
    this.images = clone(images)
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
    this.images = clone(images)
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
  new = async () => {
    if (!(await this.checkClose(t('closeUnsaveConfirm')))) {
      return
    }

    this.setPath('')
    const vivyFile = VivyFile.create()
    vivyFile.prompt = ''
    vivyFile.negativePrompt = ''
    vivyFile.images = []
    vivyFile.genOptions = clone(defGenOptions)
    this.load(vivyFile)
  }
  async open(path?: string) {
    if (!(await this.checkClose(t('closeUnsaveConfirm')))) {
      return
    }

    if (!path) {
      const { canceled, filePaths } = await main.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'vivy file', extensions: ['vivy'] }],
      })
      if (canceled) {
        return
      }
      if (isEmpty(filePaths)) {
        return
      }
      path = filePaths[0]
    }

    this.setPath(path!)
    const data = await node.readFile(path!)

    try {
      await this.load(VivyFile.decode(data))
    } catch (e) {
      notify(
        t('openProjectErr', {
          name: splitPath(path!).name,
        })
      )
    }
  }
  async load(vivyFile: VivyFile) {
    this.vivyFile = vivyFile
    const json = vivyFile.toJSON()
    const { images, selectedImage, initImage, initImageMask, genOptions } = json

    if (!isEmpty(images)) {
      runInAction(() => {
        this.images = images
      })
      if (selectedImage > -1 && images[selectedImage]) {
        const image = this.images[selectedImage]
        this.selectImage(image)
      }
    } else {
      runInAction(() => {
        this.deleteAllImages()
      })
    }

    runInAction(() => {
      extend(this.genOptions, genOptions)
      if (initImage && initImage.info) {
        this.initImage = initImage
        this.setStore('initImage', this.initImage)
        this.renderInitImage()
      } else {
        this.deleteInitImage()
      }
      if (initImageMask) {
        this.setInitImageMask(initImageMask)
      } else {
        this.deleteInitImageMask()
      }
      this.negativePrompt = json.negativePrompt
    })

    this.setPrompt(json.prompt)

    runInAction(() => {
      this.isSave = true
    })
  }
  save = async () => {
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
    vivyFile.genOptions = this.genOptions
    vivyFile.selectedImage = this.selectedImageIndex
    vivyFile.negativePrompt = this.negativePrompt
    vivyFile.prompt = this.prompt
    vivyFile.initImage = this.initImage
    vivyFile.initImageMask = this.initImageMask

    const data = VivyFile.encode(vivyFile).finish()
    await node.writeFile(this.path, data, 'utf8')
    runInAction(() => {
      this.isSave = true
    })
  }
  saveAs = async () => {
    const { canceled, filePath } = await main.showSaveDialog({
      defaultPath: `${t('untitled')}.vivy`,
    })
    if (canceled) {
      return
    }
    this.setPath(filePath)
    await this.save()
  }
  async setInitImage(data: IImage | Blob | string, mime = '') {
    let buf = new ArrayBuffer(0)
    if (isFile(data)) {
      buf = await convertBin.blobToArrBuffer(data)
    } else if (isStr(data)) {
      buf = convertBin(data, 'ArrayBuffer')
    }
    if (buf.byteLength > 0) {
      if (!mime) {
        const type = fileType(buf)
        if (type) {
          mime = type.mime
        }
      }

      if (!startWith(mime, 'image/')) {
        return
      }

      const base64Data = convertBin(buf, 'base64')
      const imageInfo = await parseImage(base64Data, mime)
      runInAction(() => {
        this.initImage = {
          id: uuid(),
          data: base64Data,
          info: {
            size: buf.byteLength,
            mime,
            ...imageInfo,
          },
        }
      })
    } else {
      runInAction(() => {
        this.initImage = data as IImage
      })
    }

    const { info } = this.initImage!
    this.setGenOption('width', info.width)
    this.setGenOption('height', info.height)

    this.setStore('initImage', this.initImage)

    this.deleteInitImageMask()
  }
  deleteInitImage() {
    this.initImage = null
    this.setStore('initImage', null)
    this.renderInitImage()
    main.closePainter()
  }
  deleteInitImageMask() {
    this.initImageMask = null
    this.setStore('initImageMask', null)
    this.renderInitImage()
    main.closePainter()
  }
  setInitImageMask(mask: string) {
    this.initImageMask = mask
    this.setStore('initImageMask', mask)
    this.renderInitImage()
    main.closePainter()
  }
  async checkClose(msg: string) {
    if (!this.isSave) {
      return await LunaModal.confirm(msg)
    }

    return true
  }
  private async renderInitImage() {
    const { initImage, initImageMask } = this

    if (!initImage) {
      this.initImagePreview = null
      return
    }

    const image = toDataUrl(initImage.data, initImage.info.mime)

    if (initImageMask) {
      const preview = await renderImageMask(image, initImageMask)
      runInAction(() => {
        this.initImagePreview = preview
      })
      return
    }

    runInAction(() => {
      this.initImagePreview = image
    })
  }
  private async setStore(name: string, val: any) {
    await main.setMainStore(name, isObservable(val) ? toJS(val) : val)
  }
  private bindEvent() {
    main.on('changeMainStore', (_, name, val) => {
      switch (name) {
        case 'prompt':
          if (this.prompt !== val) {
            runInAction(() => (this.prompt = val))
          }
          break
        case 'initImage':
          if (!this.initImage || this.initImage.data !== val.data) {
            runInAction(() => (this.initImage = val))
            this.renderInitImage()
          }
          break
        case 'initImageMask':
          if (!this.initImageMask || this.initImageMask !== val) {
            runInAction(() => (this.initImageMask = val))
            this.renderInitImage()
          }
          break
      }
    })

    main.on('saveProject', this.save)
    main.on('saveAsProject', this.saveAs)
    main.on('newProject', this.new)
    main.on('openProject', () => this.open())

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
          prompt: this.prompt,
          negativePrompt: this.negativePrompt,
          initImage: this.initImage,
          initImageMask: this.initImageMask,
          genOptions: clone(this.genOptions),
        }
      },
      () => {
        runInAction(() => {
          this.isSave = false
        })
      }
    )
  }
}

const defGenOptions = {
  sampler: 'Euler a',
  steps: 20,
  seed: -1,
  width: 512,
  height: 512,
  batchSize: 2,
  cfgScale: 7,
  denoisingStrength: 0.7,
  resizeMode: 0,
}
