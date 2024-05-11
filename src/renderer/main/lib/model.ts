import types from 'licia/types'
import each from 'licia/each'
import contain from 'licia/contain'
import { ModelType } from '../../../common/types'

const urls: types.PlainObj<string> = {
  'v1-5-pruned-emaonly':
    'https://huggingface.co/runwayml/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.safetensors',
  ESRGAN_4x: 'https://github.com/cszn/KAIR/releases/download/v1.0/ESRGAN.pth',
  'R-ESRGAN 4x+':
    'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth',
  'R-ESRGAN 4x+ Anime6B':
    'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth',
  'DAT x2':
    'https://github.com/n0kovo/dat_upscaler_models/raw/main/DAT/DAT_x2.pth',
  'DAT x3':
    'https://github.com/n0kovo/dat_upscaler_models/raw/main/DAT/DAT_x3.pth',
  'DAT x4':
    'https://github.com/n0kovo/dat_upscaler_models/raw/main/DAT/DAT_x4.pth',
  'SwinIR 4x':
    'https://github.com/JingyunLiang/SwinIR/releases/download/v0.0/003_realSR_BSRGAN_DFOWMFC_s64w8_SwinIR-L_x4_GAN.pth',
  'ScuNET GAN':
    'https://github.com/cszn/KAIR/releases/download/v1.0/scunet_color_real_gan.pth',
  'ScuNET PSNR':
    'https://github.com/cszn/KAIR/releases/download/v1.0/scunet_color_real_psnr.pth',
  deepdanbooru:
    'https://github.com/AUTOMATIC1111/TorchDeepDanbooru/releases/download/v1/model-resnet_custom_v3.pt',
  FaceXLibParsing:
    'https://github.com/xinntao/facexlib/releases/download/v0.2.2/parsing_parsenet.pth',
  FaceXLibDectection:
    'https://github.com/xinntao/facexlib/releases/download/v0.1.0/detection_Resnet50_Final.pth',
  CodeFormer:
    'https://github.com/sczhou/CodeFormer/releases/download/v0.1.0/codeformer.pth',
  GFPGAN:
    'https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.4.pth',
}

;(async function () {
  const language = await main.getLanguage()
  if (language === 'zh-CN') {
    each(urls, (url, key) => {
      if (contain(url, 'huggingface.co')) {
        urls[key] = url.replace('huggingface.co', 'hf-mirror.com')
      }
    })
  }
})()

export function getModelUrl(name: string) {
  return urls[name]
}

interface ModelParam {
  url: string
  fileName: string
  type: ModelType
}

export async function downloadModels(params: ModelParam[]) {
  let allExist = true

  for (let i = 0, len = params.length; i < len; i++) {
    const param = params[i]
    if (!(await main.isModelExists(param.type, param.fileName))) {
      await main.downloadModel(param)
      allExist = false
    }
  }

  if (!allExist) {
    main.showDownload()
  }

  return allExist
}

export async function checkFaceXLibModel() {
  const param1 = {
    url: getModelUrl('FaceXLibParsing'),
    fileName: 'parsing_parsenet.pth',
    type: ModelType.GFPGAN,
  }

  const param2 = {
    url: getModelUrl('FaceXLibDectection'),
    fileName: 'detection_Resnet50_Final.pth',
    type: ModelType.GFPGAN,
  }

  return await downloadModels([param1, param2])
}

export async function checkGfpganModel() {
  const param = {
    url: getModelUrl('GFPGAN'),
    fileName: 'GFPGANv1.4.pth',
    type: ModelType.GFPGAN,
  }

  return await downloadModels([param])
}

export async function checkCodeFormerModel() {
  const param = {
    url: getModelUrl('CodeFormer'),
    fileName: 'codeformer-v0.1.0.pth',
    type: ModelType.CodeFormer,
  }

  return await downloadModels([param])
}

const upscalersWithoutModel = ['None', 'Lanczos', 'Nearest']

export async function checkUpscalerModel(upscaler: string) {
  if (contain(upscalersWithoutModel, upscaler)) {
    return true
  }

  const upscalerParams: any = {
    ESRGAN_4x: {
      fileName: 'ESRGAN_4x.pth',
      type: ModelType.ESRGAN,
    },
    LDSR: {
      url: 'https://heibox.uni-heidelberg.de/f/578df07c8fc04ffbadf3/?dl=1',
      fileName: 'model.ckpt',
      type: ModelType.LDSR,
    },
    'R-ESRGAN 4x+': {
      fileName: 'RealESRGAN_x4plus.pth',
      type: ModelType.RealESRGAN,
    },
    'R-ESRGAN 4x+ Anime6B': {
      fileName: 'RealESRGAN_x4plus_anime_6B.pth',
      type: ModelType.RealESRGAN,
    },
    'ScuNET GAN': {
      fileName: 'ScuNET.pth',
      type: ModelType.ScuNET,
    },
    'ScuNET PSNR': {
      fileName: 'ScuNET.pth',
      type: ModelType.ScuNET,
    },
    'SwinIR 4x': {
      fileName: 'SwinIR_4x.pth',
      type: ModelType.SwinIR,
    },
    'DAT x2': {
      fileName: 'DAT_x2.pth',
      type: ModelType.DAT,
    },
    'DAT x3': {
      fileName: 'DAT_x3.pth',
      type: ModelType.DAT,
    },
    'DAT x4': {
      fileName: 'DAT_x4.pth',
      type: ModelType.DAT,
    },
  }

  upscalerParams['SwinIR_4x'] = upscalerParams['SwinIR 4x']
  upscalerParams['ScuNET'] = upscalerParams['ScuNET GAN']

  const param = upscalerParams[upscaler]
  if (!param.url) {
    param.url = getModelUrl(upscaler)
  }

  return await downloadModels([param])
}

export async function checkInterrogateModel(model: string) {
  const modelParams = {
    clip: {
      url: 'https://storage.googleapis.com/sfr-vision-language-research/BLIP/models/model_base_caption_capfilt_large.pth',
      fileName: 'model_base_caption_capfilt_large.pth',
      type: ModelType.BLIP,
    },
    deepdanbooru: {
      url: getModelUrl('deepdanbooru'),
      fileName: 'model-resnet_custom_v3.pt',
      type: ModelType.Deepdanbooru,
    },
  }

  const param = modelParams[model]

  return downloadModels([param])
}
