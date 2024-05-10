export enum ModelType {
  StableDiffusion = 'Stable-diffusion',
  Lora = 'Lora',
  LDSR = 'LDSR',
  ESRGAN = 'ESRGAN',
  RealESRGAN = 'RealESRGAN',
  ScuNET = 'ScuNET',
  Embedding = 'Embedding',
  SwinIR = 'SwinIR',
  BLIP = 'BLIP',
  Deepdanbooru = 'Deepdanbooru',
  VAE = 'VAE',
  DAT = 'DAT',
  CodeFormer = 'Codeformer',
  GFPGAN = 'GFPGAN',
  ControlNet = 'ControlNet',
}

export const modelTypes = {
  'Stable Diffusion': ModelType.StableDiffusion,
  VAE: ModelType.VAE,
  Lora: ModelType.Lora,
  Embedding: ModelType.Embedding,
}

export interface IModel {
  name: string
  size: number
  path: string
  createdDate: number
  preview?: string
}
