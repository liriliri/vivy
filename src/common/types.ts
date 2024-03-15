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
}

export const modelTypes = {
  'Stable Diffusion': ModelType.StableDiffusion,
  Lora: ModelType.Lora,
  Embedding: ModelType.Embedding,
}

export interface IModel {
  name: string
  size: number
  createdDate: number
  preview?: string
}
