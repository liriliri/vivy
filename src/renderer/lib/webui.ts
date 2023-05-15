import axios, { AxiosResponse } from 'axios'
import { invokeMain } from './util'

type SamplerName =
  | 'Euler a'
  | 'Euler'
  | 'LMS'
  | 'Heun'
  | 'DPM2'
  | 'DPM2 a'
  | 'DPM++ 2S a'
  | 'DPM++ 2M'
  | 'DPM++ SDE'
  | 'DPM fast'
  | 'DPM adaptive'
  | 'LMS Karras'
  | 'DPM2 Karras'
  | 'DPM2 a Karras'
  | 'DPM++ 2S a Karras'
  | 'DPM++ 2M Karras'
  | 'DPM++ SDE Karras'
  | 'DDIM'
  | 'PLMS'
  | 'UniPC'
  | string

type HiResUpscalerName =
  | 'None'
  | 'Latent'
  | 'Latent (antialiased)'
  | 'Latent (bicubic)'
  | 'Latent (bicubic antialiased)'
  | 'Latent (nearist)'
  | 'Latent (nearist-exact)'
  | 'Lanczos'
  | 'Nearest'
  | 'ESRGAN_4x'
  | 'LDSR'
  | 'ScuNET GAN'
  | 'ScuNET PSNR'
  | 'SwinIR 4x'
  | string

type Progress = {
  progress: number
  eta_relative: number
  state: {
    skipped: boolean
    interrupted: boolean
    job: string
    job_count: number
    job_timestamp: string
    job_no: number
    sampling_step: number
    sampling_steps: number
  }
  current_image: string
  textinfo: string
}

type Txt2ImgOptions = {
  enable_hr?: boolean
  hr_scale?: number
  hr_upscaler?: HiResUpscalerName
  hr_second_pass_steps?: number
  hr_resize_x?: number
  hr_resize_y?: number
  denoising_strength?: number
  firstphase_width?: number
  firstphase_height?: number
  prompt?: string
  styles?: string[]
  seed?: number
  subseed?: number
  subseed_strength?: number
  seed_resize_from_h?: number
  seed_resize_from_w?: number
  batch_size?: number
  n_iter?: number
  steps?: number
  cfg_scale?: number
  width?: number
  height?: number
  restore_faces?: boolean
  tiling?: boolean
  do_not_save_samples?: boolean
  do_not_save_grid?: boolean
  negative_prompt?: string
  eta?: number
  s_churn?: number
  s_tmax?: number
  s_tmin?: number
  s_noise?: number
  override_settings?: Record<string, unknown>
  override_settings_restore_afterwards?: boolean
  script_args?: unknown[]
  script_name?: string
  send_images?: boolean
  save_images?: boolean
  alwayson_scripts?: Record<string, unknown>
  sampler_name?: SamplerName
  use_deprecated_controlnet?: boolean
}

type ApiRawResponse = {
  image?: string
  images?: string[]
  info?: any
  html_info?: any
  parameters?: any
}

type AxiosApiRawResponse = AxiosResponse<ApiRawResponse>

const api = axios.create({
  baseURL: 'http://127.0.0.1:7860',
  headers: {
    'Content-Type': 'application/json',
  },
})

;(async () => {
  const port = await invokeMain('getWebuiPort')
  api.defaults.baseURL = `http://127.0.0.1:${port}`
})()

const config = {
  defaultStepCount: 20,
  defaultSampler: 'Euler a',
}

class StableDiffusionResult {
  images: string[] = []
  info: any
  parameters: any

  constructor(public response: AxiosApiRawResponse) {
    if (response.data.image && typeof response.data.image === 'string') {
      this.addImage(response.data.image)
    }

    if (response.data.images && Array.isArray(response.data.images)) {
      response.data.images.forEach(this.addImage)
    }

    this.info = response.data.info || response.data.html_info || {}
    this.parameters = response.data.parameters || {}
  }

  private addImage = (image: string) => {
    this.images.push(image)
  }

  public get image(): string {
    return this.images[0]
  }
}

export async function txt2img(
  options: Txt2ImgOptions
): Promise<StableDiffusionResult> {
  const response = await api.post<ApiRawResponse>('/sdapi/v1/txt2img', {
    enable_hr: options.enable_hr ?? false,
    hr_scale: options.hr_scale ?? 2,
    hr_upscaler: options.hr_upscaler ?? 'Latent',
    hr_second_pass_steps: options.hr_second_pass_steps ?? 0,
    hr_resize_x: options.hr_resize_x ?? 0,
    hr_resize_y: options.hr_resize_y ?? 0,
    denoising_strength: options.denoising_strength ?? 0.7,
    firstphase_width: options.firstphase_width ?? 0,
    firstphase_height: options.firstphase_height ?? 0,
    prompt: options.prompt ?? '',
    styles: options.styles ?? [],
    seed: options.seed ?? -1,
    subseed: options.subseed ?? -1,
    subseed_strength: options.subseed_strength ?? 0.0,
    seed_resize_from_h: options.seed_resize_from_h ?? 0,
    seed_resize_from_w: options.seed_resize_from_w ?? 0,
    batch_size: options.batch_size ?? 1,
    n_iter: options.n_iter ?? 1,
    steps: options.steps ?? config.defaultStepCount,
    cfg_scale: options.cfg_scale ?? 7.0,
    width: options.width ?? 512,
    height: options.height ?? 512,
    restore_faces: options.restore_faces ?? false,
    tiling: options.tiling ?? false,
    do_not_save_samples: options.do_not_save_samples ?? false,
    do_not_save_grid: options.do_not_save_grid ?? false,
    negative_prompt: options.negative_prompt ?? '',
    eta: options.eta ?? 1.0,
    s_churn: options.s_churn ?? 0,
    s_tmax: options.s_tmax ?? 0,
    s_tmin: options.s_tmin ?? 0,
    s_noise: options.s_noise ?? 1,
    override_settings: options.override_settings ?? {},
    override_settings_restore_afterwards:
      options.override_settings_restore_afterwards ?? true,
    script_args: options.script_args ?? [],
    script_name: options.script_name ?? null,
    send_images: options.send_images ?? true,
    save_images: options.save_images ?? false,
    sampler_name: options.sampler_name ?? config.defaultSampler,
    use_deprecated_controlnet: options.use_deprecated_controlnet ?? false,
  })
  return new StableDiffusionResult(response)
}

export async function getProgress(
  skipCurrentImage: boolean = false
): Promise<Progress> {
  const response = await api.get<Progress>(
    `/sdapi/v1/progress?skipCurrentImage=${skipCurrentImage}`
  )
  return response.data
}

export async function waitForReady(
  checkInterval: number = 5.0
): Promise<boolean> {
  return new Promise((resolve, _reject) => {
    const interval = setInterval(async () => {
      const result = await getProgress()
      const progress = result.progress
      const jobCount = result.state.job_count

      if (progress === 0.0 && jobCount === 0) {
        clearInterval(interval)
        resolve(true)
      } else {
        console.log(
          `[WAIT]: progress = ${progress.toFixed(4)}, job_count = ${jobCount}`
        )
      }
    }, checkInterval * 1000)
  })
}
