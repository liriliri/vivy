import axios from 'axios'
import now from 'licia/now'
import { getEasyDiffusionUrl } from './util'

const sessionId = now()

export async function ping() {
  const url = await getEasyDiffusionUrl(`ping?session_id=${sessionId}`)
  const result = await axios.get(url)

  return result.data
}

export async function generateImage(options: IGenerateSetting) {
  const url = await getEasyDiffusionUrl('render')
  const result = await axios.post(url, {
    active_tags: [],
    block_nsfw: false,
    guidance_scale: 1.1,
    height: options.height,
    inactive_tags: [],
    metadata_output_format: 'none',
    negative_prompt: options.negativePrompt,
    num_inference_steps: 35,
    num_outputs: 1,
    original_prompt: options.prompt,
    output_format: 'jpeg',
    output_lossless: false,
    output_quality: 75,
    prompt: options.prompt,
    sampler_name: options.sampler,
    seed: 326488850,
    session_id: sessionId,
    show_only_filtered_image: true,
    stream_image_progress: false,
    stream_progress_updates: true,
    use_face_correction: 'GFPGANv1.3',
    use_stable_diffusion_model: 'dreamshaper_4BakedVae',
    use_vae_model: '',
    used_random_seed: true,
    vram_usage_level: 'balanced',
    width: options.width,
  })

  return result.data
}

export async function getImageProgress(id: string) {
  const url = await getEasyDiffusionUrl(`image/stream/${id}`)
  const result = await axios.get(url)

  return result.data
}
