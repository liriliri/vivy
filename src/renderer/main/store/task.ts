import Emitter from 'licia/Emitter'
import uuid from 'licia/uuid'
import { IImage, ITxt2ImgOptions } from './types'
import { action, makeObservable, observable, runInAction } from 'mobx'
import * as webui from '../../lib/webui'
import { splitImage, toDataUrl } from '../../lib/util'
import base64 from 'licia/base64'

export enum TaskStatus {
  Wait,
  Generating,
  Complete,
}

export class Task extends Emitter {
  id = uuid()
  status = TaskStatus.Wait
  images: IImage[] = []
  progress = 0
  private currentImage: string = ''
  private txt2imgOptions: ITxt2ImgOptions
  private progressTimer?: NodeJS.Timeout
  constructor(txt2imgOptions: ITxt2ImgOptions) {
    super()

    makeObservable(this, {
      images: observable,
      progress: observable,
      status: observable,
      getProgress: action,
      run: action,
    })

    this.txt2imgOptions = txt2imgOptions
    for (let i = 0; i < txt2imgOptions.batchSize; i++) {
      this.images[i] = {
        id: uuid(),
        data: '',
        info: {
          prompt: txt2imgOptions.prompt,
          negativePrompt: txt2imgOptions.negativePrompt,
          width: txt2imgOptions.width,
          height: txt2imgOptions.height,
          size: 0,
        },
      }
    }
  }
  async run() {
    const { txt2imgOptions } = this
    this.status = TaskStatus.Generating
    this.getProgress()
    const result = await webui.txt2img({
      prompt: txt2imgOptions.prompt,
      negative_prompt: txt2imgOptions.negativePrompt,
      batch_size: txt2imgOptions.batchSize,
      steps: txt2imgOptions.steps,
      sampler_name: txt2imgOptions.sampler,
      cfg_scale: txt2imgOptions.cfgScale,
      width: txt2imgOptions.width,
      height: txt2imgOptions.height,
      seed: txt2imgOptions.seed,
    })
    this.progress = 100
    this.status = TaskStatus.Complete
    if (this.progressTimer) {
      clearTimeout(this.progressTimer)
    }
    for (let i = 0; i < txt2imgOptions.batchSize; i++) {
      const image = this.images[i]
      image.data = result.images[i]
      image.info.size = base64.decode(image.data).length
    }
    this.emit('complete', this.images)
  }
  async getProgress() {
    const { batchSize } = this.txt2imgOptions

    const { current_image, progress } = await webui.getProgress()

    runInAction(() => {
      this.progress = Math.round(progress * 100)
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
