export enum ModelType {
  StableDiffusion = 'Stable-diffusion',
  Lora = 'Lora',
  LDSR = 'LDSR',
  ESRGAN = 'ESRGAN',
  RealESRGAN = 'RealESRGAN',
  ScuNET = 'ScuNET',
  Embedding = 'Embedding',
}

export const modelTypes = {
  'Stable Diffusion': ModelType.StableDiffusion,
  Lora: ModelType.Lora,
  LDSR: ModelType.LDSR,
  ESRGAN: ModelType.ESRGAN,
  RealESRGAN: ModelType.RealESRGAN,
  ScuNET: ModelType.ScuNET,
  Embedding: ModelType.Embedding,
}

export interface IModel {
  name: string
  size: number
  createdDate: number
}
