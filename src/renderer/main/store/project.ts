import { action, makeObservable, observable, reaction, runInAction } from 'mobx'
import { VivyFile } from '../lib/vivyFile'
import { t, notify, setMainStore, setMemStore } from '../../lib/util'
import { blurAll, renderImageMask, toImage } from '../lib/util'
import { IImage, IGenOptions, IImageInfo } from './types'
import isEmpty from 'licia/isEmpty'
import each from 'licia/each'
import swap from 'licia/swap'
import remove from 'licia/remove'
import idxOf from 'licia/idxOf'
import hotkey from 'licia/hotkey'
import clone from 'licia/clone'
import extend from 'licia/extend'
import convertBin from 'licia/convertBin'
import uuid from 'licia/uuid'
import startWith from 'licia/startWith'
import base64 from 'licia/base64'
import fileType from 'licia/fileType'
import last from 'licia/last'
import ric from 'licia/ric'
import map from 'licia/map'
import { ISDGenData, IImageGenData, parseImage } from '../lib/genData'
import contain from 'licia/contain'
import * as webui from '../../lib/webui'
import LunaModal from 'luna-modal'
import splitPath from 'licia/splitPath'
import range from 'licia/range'
import isNum from 'licia/isNum'
import some from 'licia/some'
import unique from 'licia/unique'
import dataUrl from 'licia/dataUrl'

const CONTROL_NET_UNIT_COUNT = 3

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
  schedulers: webui.Scheduler[] = []
  genOptions: IGenOptions = clone(defGenOptions)
  controlNetUnits: ControlNetUnit[] = map(range(CONTROL_NET_UNIT_COUNT), () => {
    return new ControlNetUnit()
  })
  selectedControlNetUnit = this.controlNetUnits[0]
  private selectedImageIndex = -1
  private vivyFile: VivyFile | null = null
  constructor() {
    makeObservable(this, {
      prompt: observable,
      negativePrompt: observable,
      genOptions: observable,
      controlNetUnits: observable,
      selectedControlNetUnit: observable,
      path: observable,
      isSave: observable,
      samplers: observable,
      schedulers: observable,
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
      updateInitImage: action,
      deleteInitImageMask: action,
      deleteAllImages: action,
      moveImageLeft: action,
      moveImageRight: action,
      selectControlNetUnit: action,
    })

    this.init()
    this.bindEvent()
  }
  async init() {
    const samplers = await main.getMainStore('samplers')
    if (samplers) {
      runInAction(() => (this.samplers = samplers))
    }

    const schedulers = await main.getMainStore('schedulers')
    if (schedulers) {
      runInAction(() => (this.schedulers = schedulers))
    }

    const path = await main.getMainStore('projectPath')

    this.new()

    const openProjectPath = await main.getOpenProjectPath()
    if (openProjectPath) {
      this.open(openProjectPath)
    } else if (path && node.existsSync(path)) {
      this.open(path)
    }
  }
  async fetchSamplers() {
    const samplers = await webui.getSamplers()
    runInAction(() => {
      this.samplers = map(samplers, (sampler) => sampler.name)
    })
    if (!contain(this.samplers, this.genOptions.sampler)) {
      this.setGenOption('sampler', this.samplers[0])
    }
    setMainStore('samplers', this.samplers)
  }
  async fetchSchedulers() {
    const schedulers = await webui.getSchedulers()
    runInAction(() => {
      this.schedulers = map(schedulers, (scheduler) => {
        return {
          name: scheduler.name,
          label: scheduler.label,
        }
      })
    })
    if (
      !some(this.schedulers, (scheduler) => {
        return scheduler.name === this.genOptions.scheduler
      })
    ) {
      this.setGenOption('scheduler', 'automatic')
    }
    setMainStore('schedulers', this.schedulers)
  }
  setPrompt(prompt: string) {
    if (this.prompt === prompt) {
      return
    }
    this.prompt = prompt
    setMemStore('prompt', prompt)
  }
  setNegativePrompt(negativePrompt: string) {
    if (this.negativePrompt === negativePrompt) {
      return
    }
    this.negativePrompt = negativePrompt
  }
  async addFiles(files: FileList | Blob[]) {
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
    if (genData.clipSkip) {
      this.setGenOption('clipSkip', genData.clipSkip)
    }
    blurAll()
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
  selectControlNetUnit(unit: ControlNetUnit | number) {
    if (isNum(unit)) {
      unit = this.controlNetUnits[unit]
    }
    this.selectedControlNetUnit = unit
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
    setMainStore('projectPath', path)
    console.log('set project path', path)
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
    vivyFile.genOptions = JSON.stringify(defGenOptions)
    this.load(vivyFile)
  }
  async open(path?: string) {
    if (!(await this.checkClose(t('closeUnsaveConfirm')))) {
      return
    }

    if (!path) {
      const { filePaths } = await main.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'vivy file', extensions: ['vivy'] }],
      })
      if (isEmpty(filePaths)) {
        return
      }
      path = filePaths[0]
    } else if (!node.existsSync(path)) {
      LunaModal.alert(t('pathNotExists', { path }))
      return
    } else if (path === this.path) {
      return
    }

    const data = await node.readFile(path!)

    try {
      await this.load(VivyFile.decode(data))
      this.setPath(path!)
      this.updateRecent()
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
      extend(this.genOptions, JSON.parse(genOptions))
      if (initImage && initImage.info) {
        this.initImage = initImage
        setMemStore('initImage', this.initImage)
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

    for (let i = 0; i < CONTROL_NET_UNIT_COUNT; i++) {
      const json = vivyFile.controlNetUnits[i]
      const unit = this.controlNetUnits[i]
      await unit.parseFromJSON(json || JSON.stringify(defControlNetUnit))
    }

    this.setPrompt(json.prompt)

    runInAction(() => {
      this.isSave = true
    })

    blurAll()
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
      this.updateRecent()
    }

    const vivyFile = this.vivyFile!

    vivyFile.images = []
    each(this.images, (image) => {
      vivyFile.images.push(image)
    })
    vivyFile.genOptions = JSON.stringify(this.genOptions)
    vivyFile.selectedImage = this.selectedImageIndex
    vivyFile.negativePrompt = this.negativePrompt
    vivyFile.prompt = this.prompt
    vivyFile.initImage = this.initImage
    vivyFile.initImageMask = this.initImageMask
    vivyFile.controlNetUnits = map(this.controlNetUnits, (unit) =>
      JSON.stringify(unit.toJSON())
    )

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
    const image = await toImage(data, mime)
    if (!image) {
      return
    }
    runInAction(() => (this.initImage = image))

    const { info } = this.initImage!
    this.setGenOption('width', info.width)
    this.setGenOption('height', info.height)

    setMemStore('initImage', this.initImage)

    this.deleteInitImageMask()
  }
  deleteInitImage() {
    this.initImage = null
    setMemStore('initImage', null)

    this.deleteInitImageMask()
  }
  updateInitImage(data: string, info: Partial<IImageInfo>) {
    const initImage = this.initImage
    if (initImage) {
      initImage.data = data
      extend(initImage.info, info)
      this.setInitImage(initImage)
    }
  }
  deleteInitImageMask() {
    this.initImageMask = null
    setMemStore('initImageMask', null)
    this.renderInitImage()
    main.closePainter()
  }
  setInitImageMask(mask: string) {
    this.initImageMask = mask
    setMemStore('initImageMask', mask)
    this.renderInitImage()
    main.closePainter()
  }
  async checkClose(msg: string) {
    if (!this.isSave) {
      return await LunaModal.confirm(msg)
    }

    return true
  }
  private async updateRecent() {
    let recentProjects = await main.getMainStore('recentProjects')
    recentProjects.push(this.path)
    recentProjects = unique(recentProjects).slice(0, 10)
    await main.setMainStore('recentProjects', recentProjects)
    main.updateMenu()
  }
  private async renderInitImage() {
    const { initImage, initImageMask } = this

    if (!initImage) {
      this.initImagePreview = null
      return
    }

    const image = dataUrl.stringify(initImage.data, initImage.info.mime)

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
  private bindEvent() {
    main.on('changeMemStore', (_, name, val) => {
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
    main.on('openProject', (_, path) => this.open(path))

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
          controlNetUnits: map(this.controlNetUnits, (unit) => unit.toJSON()),
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

class ControlNetUnit {
  image: IImage | null = null
  type = 'Canny'
  guidanceStart = 0
  guidanceEnd = 1
  preprocessor = 'canny'
  weight = 1
  resolution = 512
  thresholdA = 0
  thresholdB = 0
  resizeMode = 'Crop and Resize'
  controlMode = 'Balanced'
  constructor() {
    makeObservable(this, {
      image: observable,
      type: observable,
      guidanceStart: observable,
      guidanceEnd: observable,
      preprocessor: observable,
      weight: observable,
      resolution: observable,
      thresholdA: observable,
      thresholdB: observable,
      resizeMode: observable,
      controlMode: observable,
      deleteImage: action,
      setType: action,
      setWeight: action,
      setGuidanceStart: action,
      setGuidanceEnd: action,
      setPreprocessor: action,
      setResolution: action,
      setThresholdA: action,
      setThresholdB: action,
      setResizeMode: action,
      setControlMode: action,
    })
  }
  async setImage(data: IImage | Blob | string, mime = '') {
    const image = await toImage(data, mime)
    if (!image) {
      return
    }
    runInAction(() => (this.image = image))
  }
  deleteImage() {
    this.image = null
    this.parseFromJSON(JSON.stringify(defControlNetUnit))
  }
  setType(type: string) {
    this.type = type
  }
  setWeight(weight: number) {
    this.weight = weight
  }
  setGuidanceStart(guidanceStart: number) {
    this.guidanceStart = guidanceStart
  }
  setGuidanceEnd(guidanceEnd: number) {
    this.guidanceEnd = guidanceEnd
  }
  setPreprocessor(preprocessor: string) {
    this.preprocessor = preprocessor
  }
  setResolution(resolution: number) {
    this.resolution = resolution
  }
  setThresholdA(thresholdA: number) {
    this.thresholdA = thresholdA
  }
  setThresholdB(thresholdB: number) {
    this.thresholdB = thresholdB
  }
  setResizeMode(resizeMode: string) {
    this.resizeMode = resizeMode
  }
  setControlMode(controlMode: string) {
    this.controlMode = controlMode
  }
  toJSON() {
    return {
      image: this.image?.data || null,
      type: this.type,
      guidanceStart: this.guidanceStart,
      guidanceEnd: this.guidanceEnd,
      preprocessor: this.preprocessor,
      weight: this.weight,
      resolution: this.resolution,
      thresholdA: this.thresholdA,
      thresholdB: this.thresholdB,
      resizeMode: this.resizeMode,
      controlMode: this.controlMode,
    }
  }
  async parseFromJSON(json: string) {
    const data = JSON.parse(json)
    if (data.image) {
      await this.setImage(data.image)
    } else {
      runInAction(() => (this.image = null))
    }
    this.setType(data.type)
    this.setGuidanceStart(data.guidanceStart)
    this.setGuidanceEnd(data.guidanceEnd)
    this.setPreprocessor(data.preprocessor)
    this.setWeight(data.weight)
    this.setResolution(data.resolution)
    this.setThresholdA(data.thresholdA)
    this.setThresholdB(data.thresholdB)
    this.setResizeMode(data.resizeMode)
    this.setControlMode(data.controlMode)
  }
}

const defGenOptions: IGenOptions = {
  sampler: 'Euler a',
  scheduler: 'automatic',
  steps: 20,
  seed: -1,
  width: 512,
  height: 512,
  batchSize: 2,
  cfgScale: 7,
  denoisingStrength: 0.7,
  resizeMode: 0,
  maskBlur: 4,
  maskInvert: false,
  inpaintFill: 0,
  inpaintFull: false,
  inpaintFullPadding: 0,
  clipSkip: 1,
}

const defControlNetUnit = {
  image: null,
  type: 'Canny',
  guidanceStart: 0,
  guidanceEnd: 1,
  preprocessor: 'canny',
  weight: 1,
  resolution: 512,
  thresholdA: 0,
  thresholdB: 0,
  resizeMode: 'Crop and Resize',
  controlMode: 'Balanced',
}
