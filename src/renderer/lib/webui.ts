import axios, { AxiosResponse } from 'axios'
import types from 'licia/types'

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

type Ram = {
  free: number
  used: number
  total: number
}

type Memory = {
  ram: Ram
  cuda: {
    system: Ram
  }
}

type Options = {
  sd_model_checkpoint: string
  sd_vae: string
}

export type StableDiffusionModel = {
  title: string
  model_name: string
  hash: string
  sha256: string
  filename: string
  config: string
}

export type StableDiffusionVae = {
  model_name: string
  filename: string
}

export type StableDiffusionLora = {
  name: string
  alias: string
  path: string
  metadata: any
}

export type ControlTypes = types.PlainObj<{
  module_list: string[]
  model_list: string[]
  default_option: string
  default_model: string
}>

export type ControlModules = types.PlainObj<{
  model_free: false
  sliders: Array<{
    name: string
    value: number
    min: number
    max: number
    step: number
  }>
}>

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
  scheduler: string
  width: number
  height: number
  seed: number
  override_settings: types.PlainObj<any>
  alwayson_scripts: Record<string, unknown>
}

type Img2ImgOptions = {
  denoising_strength: number
  prompt: string
  negative_prompt: string
  init_images: string[]
  mask: string | null
  batch_size: number
  steps: number
  cfg_scale: number
  sampler_name: string
  scheduler: string
  width: number
  height: number
  seed: number
  resize_mode: number
  mask_blur: number
  inpainting_mask_invert: number
  inpainting_fill: number
  inpaint_full_res: boolean
  inpaint_full_res_padding: number
  override_settings: types.PlainObj<any>
  alwayson_scripts: Record<string, unknown>
}

type ExtraSingleOptions = {
  image: string
  upscaling_resize_w: number
  upscaling_resize_h: number
  upscaler1?: string
  upscaler2?: string
  extras_upscaler_2_visibility?: number
  gfpgan_visibility?: number
  codeformer_visibility?: number
  codeformer_weight?: number
}

type PreprocessOptions = {
  controlnet_module: string
  controlnet_input_images: string[]
  controlnet_processor_res?: number
  controlnet_threshold_a?: number
  controlnet_threshold_b?: number
}

type Sampler = {
  name: string
  aliases: string[]
  options: Record<string, unknown>
}

export type Scheduler = {
  name: string
  label: string
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
  const port = await main.getWebUIPort()
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
    eta: 0,
    s_churn: 0,
    s_tmax: 0,
    s_tmin: 0,
    s_noise: 1,
    override_settings: options.override_settings,
    override_settings_restore_afterwards: true,
    script_args: [],
    script_name: null,
    send_images: true,
    save_images: false,
    sampler_name: options.sampler_name,
    scheduler: options.scheduler,
    alwayson_scripts: options.alwayson_scripts,
    use_deprecated_controlnet: false,
  })
  return new StableDiffusionResult(response)
}

export async function img2img(
  options: Img2ImgOptions
): Promise<StableDiffusionResult> {
  const response = await api.post<ApiRawResponse>('/sdapi/v1/img2img', {
    init_images: options.init_images,
    resize_mode: options.resize_mode,
    denoising_strength: options.denoising_strength,
    image_cfg_scale: 1.5,
    mask: options.mask,
    mask_blur: options.mask_blur,
    inpainting_fill: options.inpainting_fill,
    inpaint_full_res: options.inpaint_full_res,
    inpaint_full_res_padding: options.inpaint_full_res_padding,
    inpainting_mask_invert: options.inpainting_mask_invert,
    initial_noise_multiplier: 1,
    prompt: options.prompt,
    styles: [],
    seed: options.seed,
    subseed: -1,
    subseed_strength: 0,
    seed_resize_from_h: 0,
    seed_resize_from_w: 0,
    sampler_name: options.sampler_name,
    scheduler: options.scheduler,
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
    eta: 0,
    s_churn: 0,
    s_tmax: 0,
    s_tmin: 0,
    s_noise: 1,
    override_settings: options.override_settings,
    override_settings_restore_afterwards: true,
    script_args: [],
    include_init_images: false,
    script_name: null,
    send_images: true,
    save_images: false,
    alwayson_scripts: options.alwayson_scripts,
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
      gfpgan_visibility: options.gfpgan_visibility || 0,
      codeformer_visibility: options.codeformer_visibility || 0,
      codeformer_weight: options.codeformer_weight || 0,
      upscaling_resize: 2,
      upscaling_resize_w: options.upscaling_resize_w || 0,
      upscaling_resize_h: options.upscaling_resize_h || 0,
      upscaling_resize_crop: true,
      upscaler_1: options.upscaler1 || 'None',
      upscaler_2: options.upscaler2 || 'None',
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

let waitPromise: Promise<boolean> | null = null

export async function wait(checkInterval: number = 5.0): Promise<boolean> {
  if (waitPromise) {
    return waitPromise
  }

  waitPromise = new Promise((resolve) => {
    async function check() {
      if (!(await main.isWebUIRunning())) {
        waitPromise = null
        return resolve(false)
      }
      try {
        const result = await getProgress()
        const progress = result.progress
        const jobCount = result.state.job_count

        if ((progress === 0.0 || progress === 0.01) && jobCount <= 0) {
          waitPromise = null
          return resolve(true)
        }
      } catch (e) {
        // @ts-ignore
      }
      setTimeout(check, checkInterval * 1000)
    }
    check()
  })

  return waitPromise
}

export async function getSdModels(): Promise<StableDiffusionModel[]> {
  const response = await api.get<StableDiffusionModel[]>('/sdapi/v1/sd-models')
  return response.data
}

export async function getSdVaes(): Promise<StableDiffusionVae[]> {
  const response = await api.get<StableDiffusionVae[]>('/sdapi/v1/sd-vae')
  return response.data
}

export async function getSdLoras(): Promise<StableDiffusionLora[]> {
  const response = await api.get<StableDiffusionLora[]>('/sdapi/v1/loras')
  return response.data
}

export async function getOptions(): Promise<Options> {
  const response = await api.get('/sdapi/v1/options')
  return response.data
}

export async function setOptions(options: Partial<Options>) {
  const response = await api.post('/sdapi/v1/options', options)
  return response.data
}

export async function getSamplers(): Promise<Sampler[]> {
  const response = await api.get<Sampler[]>('/sdapi/v1/samplers')
  return response.data
}

export async function getSchedulers(): Promise<Scheduler[]> {
  const response = await api.get<Scheduler[]>('/sdapi/v1/schedulers')
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

export async function refreshVae() {
  await api.post('/sdapi/v1/refresh-vae')
}

export async function refreshEmbeddings() {
  await api.post('/sdapi/v1/refresh-embeddings')
}

export async function refreshLoras() {
  await api.post('/sdapi/v1/refresh-loras')
}

export async function interrogate(image: string, model: string) {
  const response = await api.post<{ caption: string }>(
    '/sdapi/v1/interrogate',
    {
      image,
      model,
    }
  )
  return response.data.caption
}

export async function getMemory(): Promise<Memory> {
  const response = await api.get<Memory>('/sdapi/v1/memory')
  return response.data
}

export async function getControlTypes(): Promise<ControlTypes> {
  const response = await api.get<{
    control_types: ControlTypes
  }>('/controlnet/control_types')
  return response.data.control_types
}

export async function getControlModules(): Promise<ControlModules> {
  const response = await api.get<{
    module_detail: ControlModules
  }>('/controlnet/module_list?alias_names=true')
  return response.data.module_detail
}

export async function refreshControlModels() {
  await api.get<{
    module_list: string[]
  }>('/controlnet/model_list?update=true')
}

export async function preprocess(options: PreprocessOptions): Promise<string> {
  const response = await api.post<{ images: string[] }>(
    '/controlnet/detect',
    options
  )
  return response.data.images[0]
}
