export interface IImageInfo {
  mime: string
  width: number
  height: number
  size: number
  prompt?: string
  negativePrompt?: string
  steps?: number
  sampler?: string
  cfgScale?: number
  seed?: number
  clipSkip?: number
}

export interface IImage {
  id: string
  data: string
  info: IImageInfo
}

export interface IGenOptions {
  sampler: string
  seed: number
  width: number
  height: number
  steps: number
  batchSize: number
  cfgScale: number
  denoisingStrength: number
  resizeMode: number
  maskBlur: number
  maskInvert: boolean
  inpaintFill: number
  inpaintFull: boolean
  inpaintFullPadding: number
  clipSkip: number
}

export interface IControlNetUnit {
  image: string
  type: string
  guidanceStart: number
  guidanceEnd: number
  weight: number
  preprocessor: string
  resolution: number
  thresholdA: number
  thresholdB: number
  controlMode: number
  resizeMode: number
}

export interface IUpscaleImgOptions {
  image: string
  width: number
  height: number
  upscaler1: string
  upscaler2: string
  upscaler2Visibility: number
}

export interface IFaceRestorationOptions {
  image: string
  width: number
  height: number
  gfpganVisibility: number
  codeFormerVisibility: number
  codeFormerWeight: number
}
