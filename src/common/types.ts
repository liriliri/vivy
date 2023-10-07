export enum ModelType {
  StableDiffusion = 'Stable-diffusion',
  Lora = 'Lora',
  RealESRGAN = 'RealESRGAN',
  ScuNET = 'ScuNET',
  Embedding = 'Embedding',
}

export interface IModel {
  name: string
  size: number
  createdDate: number
}
