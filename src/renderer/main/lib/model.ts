import types from 'licia/types'
import each from 'licia/each'
import contain from 'licia/contain'

const urls: types.PlainObj<string> = {
  'v1-5-pruned-emaonly':
    'https://huggingface.co/runwayml/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.safetensors',
  ESRGAN_4x: 'https://github.com/cszn/KAIR/releases/download/v1.0/ESRGAN.pth',
  'R-ESRGAN 4x+':
    'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth',
  'R-ESRGAN 4x+ Anime6B':
    'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth',
}

;(async function () {
  const language = await main.getLanguage()
  if (language === 'zh-CN') {
    each(urls, (url, key) => {
      if (contain(url, 'huggingface.co')) {
        urls[key] = url.replace('huggingface.co', 'hf-mirror.com')
      } else if (contain(url, 'github.com')) {
        urls[key] = url.replace('github.com', '521github.com')
      }
    })
  }
})()

export function getModelUrl(name: string) {
  return urls[name]
}
