import axios from 'axios'
import now from 'licia/now'
import { getEasyDiffusionUrl } from './util'

const sessionId = now()

export async function ping() {
  const url = await getEasyDiffusionUrl(`ping?session_id=${sessionId}`)
  const result = await axios.get(url)

  return result.data
}

interface IGenerateImageOptions {
  prompt: string
}

export async function generateImage(options: IGenerateImageOptions) {
  const url = await getEasyDiffusionUrl('render')
  const result = await axios.post(url, {
    active_tags: [],
    block_nsfw: false,
    guidance_scale: 1.1,
    height: 512,
    inactive_tags: [],
    metadata_output_format: 'none',
    negative_prompt: '',
    num_inference_steps: 35,
    num_outputs: 1,
    original_prompt: 'a photograph of an astronaut riding a horse',
    output_format: 'jpeg',
    output_lossless: false,
    output_quality: 75,
    prompt: 'a photograph of an astronaut riding a horse',
    sampler_name: 'euler',
    seed: 326488850,
    session_id: '1683531438324',
    show_only_filtered_image: true,
    stream_image_progress: false,
    stream_progress_updates: true,
    use_face_correction: 'GFPGANv1.3',
    use_stable_diffusion_model: 'dreamshaper_4BakedVae',
    use_vae_model: '',
    used_random_seed: true,
    vram_usage_level: 'balanced',
    width: 512,
  })

  return result.data
}

export async function getImageProgress(id: string) {
  const url = await getEasyDiffusionUrl(`image/stream/${id}`)
  const result = await axios.get(url)

  return result.data
}
