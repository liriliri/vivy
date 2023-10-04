export enum ModelType {
  StableDiffusion = 'Stable-diffusion',
  Lora = 'Lora',
  RealESRGAN = 'RealESRGAN',
  ScuNET = 'ScuNET',
}

export interface IModel {
  name: string
  size: number
  createdDate: number
}
