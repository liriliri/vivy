import axios, { AxiosResponse } from 'axios'

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

type Options = {
  sd_model_checkpoint: string
}

type StableDiffusionModel = {
  title: string
  model_name: string
  hash: string
  sha256: string
  filename: string
  config: string
}

type ApiRawResponse = {
  image?: string
  images?: string[]
  info?: any
  html_info?: any
  parameters?: any
}

type Txt2ImgOptions = {
  prompt: string
  negative_prompt: string
  batch_size: number
  steps: number
  cfg_scale: number
  sampler_name: string
  width: number
  height: number
  seed: number
}

type Img2ImgOptions = {
  denoising_strength: number
  prompt: string
  negative_prompt: string
  init_images: string[]
  batch_size: number
  steps: number
  cfg_scale: number
  sampler_name: string
  width: number
  height: number
  seed: number
}

type ExtraSingleOptions = {
  image: string
  upscaling_resize_w: number
  upscaling_resize_h: number
  upscaler1: string
  upscaler2: string
  extras_upscaler_2_visibility: number
}

type Sampler = {
  name: string
  aliases: string[]
  options: Record<string, unknown>
}

type Upscaler = {
  name: string
  model_name: string
  model_path: string
  model_url: string
  scale: number
}

type AxiosApiRawResponse = AxiosResponse<ApiRawResponse>

const api = axios.create({
  baseURL: 'http://127.0.0.1:7860',
  headers: {
    'Content-Type': 'application/json',
  },
})

;(async () => {
  const port = await main.getWebuiPort()
  api.defaults.baseURL = `http://127.0.0.1:${port}`
})()

export class StableDiffusionResult {
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
    enable_hr: false,
    hr_scale: 2,
    hr_upscaler: 'Latent',
    hr_second_pass_steps: 0,
    hr_resize_x: 0,
    hr_resize_y: 0,
    denoising_strength: 0.7,
    firstphase_width: 0,
    firstphase_height: 0,
    prompt: options.prompt,
    styles: [],
    seed: options.seed,
    subseed: -1,
    subseed_strength: 0.0,
    seed_resize_from_h: 0,
    seed_resize_from_w: 0,
    batch_size: options.batch_size,
    n_iter: 1,
    steps: options.steps,
    cfg_scale: options.cfg_scale,
    width: options.width,
    height: options.height,
    restore_faces: false,
    tiling: false,
    do_not_save_samples: false,
    do_not_save_grid: false,
    negative_prompt: options.negative_prompt,
    eta: 1.0,
    s_churn: 0,
    s_tmax: 0,
    s_tmin: 0,
    s_noise: 1,
    override_settings: {},
    override_settings_restore_afterwards: true,
    script_args: [],
    script_name: null,
    send_images: true,
    save_images: false,
    sampler_name: options.sampler_name,
    use_deprecated_controlnet: false,
  })
  return new StableDiffusionResult(response)
}

export async function img2img(
  options: Img2ImgOptions
): Promise<StableDiffusionResult> {
  const response = await api.post<ApiRawResponse>('/sdapi/v1/img2img', {
    init_images: options.init_images,
    resize_mode: 0,
    denoising_strength: options.denoising_strength,
    image_cfg_scale: 1.5,
    mask: null,
    mask_blur: 4,
    inpainting_fill: 0,
    inpaint_full_res: true,
    inpaint_full_res_padding: 0,
    inpainting_mask_invert: 0,
    initial_noise_multiplier: 1,
    prompt: options.prompt,
    styles: [],
    seed: options.seed,
    subseed: -1,
    subseed_strength: 0,
    seed_resize_from_h: 0,
    seed_resize_from_w: 0,
    sampler_name: options.sampler_name,
    batch_size: options.batch_size ?? 1,
    n_iter: 1,
    steps: options.steps,
    cfg_scale: options.cfg_scale,
    width: options.width,
    height: options.height,
    restore_faces: false,
    tiling: false,
    do_not_save_samples: false,
    do_not_save_grid: false,
    negative_prompt: options.negative_prompt,
    eta: 1.0,
    s_churn: 0,
    s_tmax: 0,
    s_tmin: 0,
    s_noise: 1,
    override_settings: {},
    override_settings_restore_afterwards: true,
    script_args: [],
    include_init_images: false,
    script_name: null,
    send_images: true,
    save_images: false,
    alwayson_scripts: {},
    use_deprecated_controlnet: false,
  })
  return new StableDiffusionResult(response)
}

export async function extraSingle(
  options: ExtraSingleOptions
): Promise<StableDiffusionResult> {
  const response = await api.post<ApiRawResponse>(
    '/sdapi/v1/extra-single-image',
    {
      image: options.image,
      resize_mode: 0,
      show_extras_results: true,
      gfpgan_visibility: 0,
      codeformer_weight: 0,
      upscaling_resize: 2,
      upscaling_resize_w: options.upscaling_resize_w,
      upscaling_resize_h: options.upscaling_resize_h,
      upscaling_resize_crop: true,
      upscaler_1: options.upscaler1,
      upscaler_2: options.upscaler2,
      extras_upscaler_2_visibility: options.extras_upscaler_2_visibility || 0,
      upscale_first: false,
    }
  )
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
  return new Promise((resolve) => {
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

export async function getSdModels(): Promise<StableDiffusionModel[]> {
  const response = await api.get<StableDiffusionModel[]>('/sdapi/v1/sd-models')
  return response.data
}

export async function getOptions(): Promise<Options> {
  const response = await api.get('/sdapi/v1/options')
  return response.data
}

export async function setOptions(options: Options) {
  const response = await api.post('/sdapi/v1/options', options)
  return response.data
}

export async function getSamplers(): Promise<Sampler[]> {
  const response = await api.get<Sampler[]>('/sdapi/v1/samplers')
  return response.data
}

export async function getUpscalers(): Promise<Upscaler[]> {
  const response = await api.get<Upscaler[]>('/sdapi/v1/upscalers')
  return response.data
}

export async function interrupt() {
  await api.post('/sdapi/v1/interrupt')
}

export async function refreshCheckpoints() {
  await api.post('/sdapi/v1/refresh-checkpoints')
}
