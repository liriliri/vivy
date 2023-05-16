interface ITxt2ImgOptions {
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
