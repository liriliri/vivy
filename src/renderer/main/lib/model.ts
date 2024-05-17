import types from 'licia/types'
import each from 'licia/each'
import contain from 'licia/contain'
import { ModelType } from '../../../common/types'
import isArr from 'licia/isArr'
import toArr from 'licia/toArr'
import flatten from 'licia/flatten'
import startWith from 'licia/startWith'
import { notify, t } from '../../lib/util'

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
  AnnotatorDepthMidas:
    'https://huggingface.co/lllyasviel/ControlNet/resolve/main/annotator/ckpts/dpt_hybrid-midas-501f0c75.pt',
  AnnotatorDepthZoe:
    'https://huggingface.co/lllyasviel/Annotators/resolve/main/ZoeD_M12_N.pt',
  AnnotatorDepthLeres:
    'https://huggingface.co/lllyasviel/Annotators/resolve/main/res101.pth',
  AnnotatorDepthLeres2:
    'https://huggingface.co/lllyasviel/Annotators/resolve/main/latest_net_G.pth',
  AnnotatorLineartRealistic:
    'https://huggingface.co/lllyasviel/Annotators/resolve/main/sk_model.pth',
  AnnotatorLineartCoarse:
    'https://huggingface.co/lllyasviel/Annotators/resolve/main/sk_model2.pth',
  AnnotatorLineartAnimeDenoise:
    'https://huggingface.co/lllyasviel/Annotators/resolve/main/erika.pth',
  AnnotatorLineartAnime:
    'https://huggingface.co/lllyasviel/Annotators/resolve/main/netG.pth',
  AnnotatorMLSD:
    'https://huggingface.co/lllyasviel/ControlNet/resolve/main/annotator/ckpts/mlsd_large_512_fp32.pth',
  AnnotatorNormalMapBae:
    'https://huggingface.co/lllyasviel/Annotators/resolve/main/scannet.pt',
  AnnotatorNormalMapDshine:
    'https://huggingface.co/bdsqlsz/qinglong_controlnet-lllite/resolve/main/Annotators/dsine.pt',
  AnnotatorOpenPoseBody:
    'https://huggingface.co/lllyasviel/Annotators/resolve/main/body_pose_model.pth',
  AnnotatorOpenPoseHand:
    'https://huggingface.co/lllyasviel/Annotators/resolve/main/hand_pose_model.pth',
  AnnotatorOpenPoseFace:
    'https://huggingface.co/lllyasviel/Annotators/resolve/main/facenet.pth',
  AnnotatorDensePose:
    'https://huggingface.co/LayerNorm/DensePose-TorchScript-with-hint-image/resolve/main/densepose_r50_fpn_dl.torchscript',
  AnnotatorPidinet:
    'https://huggingface.co/lllyasviel/Annotators/resolve/main/table5_pidinet.pth',
  AnnotatorHed:
    'https://huggingface.co/lllyasviel/Annotators/resolve/main/ControlNetHED.pth',
  AnnotatorAnimeFaceSegment:
    'https://huggingface.co/bdsqlsz/qinglong_controlnet-lllite/resolve/main/Annotators/UNet.pth',
  AnnotatorOneformerAde20k:
    'https://huggingface.co/lllyasviel/Annotators/resolve/main/250_16_swin_l_oneformer_ade20k_160k.pth',
  AnnotatorOneformerCoco:
    'https://huggingface.co/lllyasviel/Annotators/resolve/main/150_16_swin_l_oneformer_coco_100ep.pth',
  AnnotatorUniformer:
    'https://huggingface.co/lllyasviel/ControlNet/resolve/main/annotator/ckpts/upernet_global_small.pth',
  ControlNetCanny:
    'https://huggingface.co/comfyanonymous/ControlNet-v1-1_fp16_safetensors/resolve/main/control_v11p_sd15_canny_fp16.safetensors',
  ControlNetLineart:
    'https://huggingface.co/comfyanonymous/ControlNet-v1-1_fp16_safetensors/resolve/main/control_v11p_sd15_lineart_fp16.safetensors',
  ControlNetOpenPose:
    'https://huggingface.co/comfyanonymous/ControlNet-v1-1_fp16_safetensors/resolve/main/control_v11p_sd15_openpose_fp16.safetensors',
  ControlNetDepth:
    'https://huggingface.co/comfyanonymous/ControlNet-v1-1_fp16_safetensors/resolve/main/control_v11f1p_sd15_depth_fp16.safetensors',
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

export interface IModelParam {
  url: string
  fileName: string
  type: ModelType
}

export async function downloadModels(...params: Array<IModelParam[]>) {
  let allExist = true

  const models = flatten(params)

  for (let i = 0, len = models.length; i < len; i++) {
    const model = models[i]
    if (!(await main.isModelExists(model.type, model.fileName))) {
      if (allExist) {
        allExist = false
        notify(t('modelMissingErr'))
        main.showDownload()
      }
      await main.downloadModel(model)
    }
  }

  return allExist
}

export function checkFaceXLibModel() {
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

  return [param1, param2]
}

export function checkGfpganModel() {
  return [
    {
      url: getModelUrl('GFPGAN'),
      fileName: 'GFPGANv1.4.pth',
      type: ModelType.GFPGAN,
    },
  ]
}

export function checkCodeFormerModel() {
  return [
    {
      url: getModelUrl('CodeFormer'),
      fileName: 'codeformer-v0.1.0.pth',
      type: ModelType.CodeFormer,
    },
  ]
}

const upscalersWithoutModel = ['None', 'Lanczos', 'Nearest']

export function checkUpscalerModel(upscaler: string) {
  if (contain(upscalersWithoutModel, upscaler)) {
    return []
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
  if (!param) {
    return []
  }

  if (!param.url) {
    param.url = getModelUrl(upscaler)
  }

  return [param]
}

export function checkInterrogateModel(model: string) {
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

  return [param]
}

export function checkPreprocessModel(preprocessor: string) {
  let param: any

  const params = {
    depth_midas: {
      url: getModelUrl('AnnotatorDepthMidas'),
      fileName: 'midas/dpt_hybrid-midas-501f0c75.pt',
    },
    depth_zoe: {
      url: getModelUrl('AnnotatorDepthZoe'),
      fileName: 'zoedepth/ZoeD_M12_N.pt',
    },
    lineart_realistic: {
      url: getModelUrl('AnnotatorLineartRealistic'),
      fileName: 'lineart/sk_model.pth',
    },
    lineart_coarse: {
      url: getModelUrl('AnnotatorLineartCoarse'),
      fileName: 'lineart/sk_model2.pth',
    },
    lineart_anime_denoise: {
      url: getModelUrl('AnnotatorLineartAnimeDenoise'),
      fileName: 'manga_line/erika.pth',
    },
    lineart_anime: {
      url: getModelUrl('AnnotatorLineartAnime'),
      fileName: 'lineart_anime/netG.pth',
    },
    mlsd: {
      url: getModelUrl('AnnotatorMLSD'),
      fileName: 'mlsd/mlsd_large_512_fp32.pth',
    },
    normal_bae: {
      url: getModelUrl('AnnotatorNormalMapBae'),
      fileName: 'normal_bae/scannet.pt',
    },
    normal_dsine: {
      url: getModelUrl('AnnotatorNormalMapDshine'),
      fileName: 'normal_dsine/dsine.pt',
    },
    seg_anime_face: {
      url: getModelUrl('AnnotatorAnimeFaceSegment'),
      fileName: 'anime_face_segment/UNet.pth',
    },
    seg_ofade20k: {
      url: getModelUrl('AnnotatorOneformerAde20k'),
      fileName: 'oneformer/250_16_swin_l_oneformer_ade20k_160k.pth',
    },
    seg_ofcoco: {
      url: getModelUrl('AnnotatorOneformerCoco'),
      fileName: 'oneformer/150_16_swin_l_oneformer_coco_100ep.pth',
    },
  }
  params['seg_ufade20k'] = [
    params.seg_ofade20k,
    {
      url: getModelUrl('AnnotatorUniformer'),
      fileName: 'uniformer/upernet_global_small.pth',
    },
  ]

  param = params[preprocessor]

  if (contain(['scribble_pidinet', 'softedge_pidinet'], preprocessor)) {
    param = {
      url: getModelUrl('AnnotatorPidinet'),
      fileName: 'pidinet/table5_pidinet.pth',
    }
  } else if (contain(['scribble_hed', 'softedge_hed'], preprocessor)) {
    param = {
      url: getModelUrl('AnnotatorHed'),
      fileName: 'hed/ControlNetHED.pth',
    }
  }

  if (startWith(preprocessor, 'openpose')) {
    param = [
      {
        url: getModelUrl('AnnotatorOpenPoseBody'),
        fileName: 'openpose/body_pose_model.pth',
      },
      {
        url: getModelUrl('AnnotatorOpenPoseHand'),
        fileName: 'openpose/hand_pose_model.pth',
      },
      {
        url: getModelUrl('AnnotatorOpenPoseFace'),
        fileName: 'openpose/facenet.pth',
      },
    ]
  } else if (startWith(preprocessor, 'densepose')) {
    param = [
      {
        url: getModelUrl('AnnotatorDensePose'),
        fileName: 'densepose/densepose_r50_fpn_dl.torchscript',
      },
    ]
  }
  if (startWith(preprocessor, 'depth_leres')) {
    param = [
      {
        url: getModelUrl('AnnotatorDepthLeres'),
        fileName: 'leres/res101.pth',
      },
      {
        url: getModelUrl('AnnotatorDepthLeres2'),
        fileName: 'leres/latest_net_G.pth',
      },
    ]
  }

  if (!param) {
    return []
  }

  if (!isArr(param)) {
    param = toArr(param)
  }
  each(param, (param: any) => {
    param.type = ModelType.ControlNet
  })
  return param
}

export function checkControlNetModel(type: string) {
  const params = {
    Canny: {
      url: getModelUrl('ControlNetCanny'),
      fileName: 'control_v11p_sd15_canny_fp16.safetensors',
    },
    Lineart: {
      url: getModelUrl('ControlNetLineart'),
      fileName: 'control_v11p_sd15_lineart_fp16.safetensors',
    },
    OpenPose: {
      url: getModelUrl('ControlNetOpenPose'),
      fileName: 'control_v11p_sd15_openpose_fp16.safetensors',
    },
    Depth: {
      url: getModelUrl('ControlNetDepth'),
      fileName: 'control_v11f1p_sd15_depth_fp16.safetensors',
    },
  }

  const param = params[type]
  if (!param) {
    return []
  }

  param.type = ModelType.ControlNet
  return [param]
}
