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
