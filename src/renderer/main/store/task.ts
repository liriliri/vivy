import Emitter from 'licia/Emitter'
import uuid from 'licia/uuid'
import { IImage, IGenOptions, IUpscaleImgOptions } from './types'
import { action, makeObservable, observable, runInAction } from 'mobx'
import * as webui from '../../lib/webui'
import { splitImage, toDataUrl } from '../../lib/util'
import base64 from 'licia/base64'
import trim from 'licia/trim'
import startWith from 'licia/startWith'
import toNum from 'licia/toNum'

export enum TaskStatus {
  Wait,
  Generating,
  Complete,
}

export class Task extends Emitter {
  id = uuid()
  images: IImage[] = []
  progress = 0
  status = TaskStatus.Wait
  constructor() {
    super()

    makeObservable(this, {
      images: observable,
      progress: observable,
      status: observable,
    })
  }
  run() {}
}

export class GenTask extends Task {
  private currentImage: string = ''
  private genOptions: IGenOptions
  private progressTimer?: NodeJS.Timeout
  private prompt: string
  private negativePrompt: string
  constructor(prompt, negativePrompt, genOptions: IGenOptions) {
    super()

    makeObservable(this, {
      getProgress: action,
      run: action,
    })

    this.prompt = prompt
    this.negativePrompt = negativePrompt
    this.genOptions = genOptions
    for (let i = 0; i < genOptions.batchSize; i++) {
      this.images[i] = {
        id: uuid(),
        data: '',
        save: false,
        info: {
          mime: 'image/png',
          prompt,
          negativePrompt,
          width: genOptions.width,
          height: genOptions.height,
          size: 0,
          sampler: genOptions.sampler,
          steps: genOptions.steps,
          cfgScale: genOptions.cfgScale,
        },
      }
    }
  }
  async run() {
    const { genOptions, prompt, negativePrompt } = this
    this.status = TaskStatus.Generating
    this.getProgress()
    const result = await webui.txt2img({
      prompt,
      negative_prompt: negativePrompt,
      batch_size: genOptions.batchSize,
      steps: genOptions.steps,
      sampler_name: genOptions.sampler,
      cfg_scale: genOptions.cfgScale,
      width: genOptions.width,
      height: genOptions.height,
      seed: genOptions.seed,
    })
    this.progress = 100
    this.status = TaskStatus.Complete
    if (this.progressTimer) {
      clearTimeout(this.progressTimer)
    }
    const info = JSON.parse(result.info)
    for (let i = 0; i < genOptions.batchSize; i++) {
      const image = this.images[i]
      image.data = result.images[i]
      image.info.size = base64.decode(image.data).length
      image.info.seed = info.all_seeds[i]
    }
    this.emit('complete', this.images)
  }
  async getProgress() {
    const { batchSize } = this.genOptions

    const { current_image, progress } = await webui.getProgress()

    runInAction(() => {
      const newProgress = Math.round(progress * 100)
      if (newProgress > this.progress) {
        this.progress = newProgress
      }
    })

    if (this.status !== TaskStatus.Complete) {
      this.progressTimer = setTimeout(() => this.getProgress(), 1000)
      if (current_image && current_image !== this.currentImage) {
        this.currentImage = current_image
        const images = await splitImage(
          toDataUrl(current_image, 'image/png'),
          batchSize
        )
        for (let i = 0; i < batchSize; i++) {
          this.images[i].data = images[i]
        }
      }
    }
  }
}

export class UpscaleImgTask extends Task {
  private upscaleImgOptions: IUpscaleImgOptions
  private upscalerNum = 0
  constructor(upscaleImgOptions: IUpscaleImgOptions) {
    super()

    makeObservable(this, {
      getProgress: action,
      run: action,
    })

    this.upscaleImgOptions = upscaleImgOptions

    if (upscaleImgOptions.upscaler1 !== 'None') {
      this.upscalerNum++
    }
    if (
      upscaleImgOptions.upscaler2 !== 'None' &&
      upscaleImgOptions.upscaler2Visibility > 0
    ) {
      this.upscalerNum++
    }

    this.images.push({
      id: uuid(),
      data: '',
      save: false,
      info: {
        mime: 'image/png',
        width: upscaleImgOptions.width,
        height: upscaleImgOptions.height,
        size: 0,
      },
    })
  }
  async run() {
    const { upscaleImgOptions } = this
    this.status = TaskStatus.Generating
    main.on('addLog', this.getProgress)
    const result = await webui.extraSingle({
      image: upscaleImgOptions.image,
      upscaling_resize_w: upscaleImgOptions.width,
      upscaling_resize_h: upscaleImgOptions.height,
      upscaler1: upscaleImgOptions.upscaler1,
      upscaler2: upscaleImgOptions.upscaler2,
      extras_upscaler_2_visibility: upscaleImgOptions.upscaler2Visibility,
    })
    this.progress = 100
    this.status = TaskStatus.Complete
    main.off('addLog', this.getProgress)
    const image = this.images[0]
    image.data = result.images[0]
    image.info.size = base64.decode(image.data).length
    this.emit('complete', this.images)
  }
  getProgress = (event, log) => {
    log = trim(log)
    let current = ''
    let total = ''
    if (startWith(log, 'Tile')) {
      ;[current, total] = log.slice(5).split('/')
    } else if (startWith(log, 'ScuNET tiles')) {
      ;[current, total] = trim(log.match(/ \d+\/\d+ /)[0]).split('/')
    }
    if (current) {
      runInAction(() => {
        const progress = Math.round((toNum(current) / toNum(total)) * 100)
        if (this.upscalerNum === 2) {
          this.progress = Math.round(
            (this.progress >= 50 ? 50 : 0) + progress * 0.5
          )
        } else {
          this.progress = progress
        }
      })
    }
  }
}
