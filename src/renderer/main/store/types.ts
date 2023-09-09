export interface IImageInfo {
  prompt?: string
  negativePrompt?: string
  mime: string
  width: number
  height: number
  size: number
}

export interface IImage {
  id: string
  data: string
  info: IImageInfo
}

export interface ITxt2ImgOptions {
  prompt: string
  negativePrompt: string
  sampler: string
  seed: number
  width: number
  height: number
  steps: number
  batchSize: number
  model: string
  cfgScale: number
}
