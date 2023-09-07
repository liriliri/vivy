import types from 'licia/types'
import loadImg from 'licia/loadImg'
import I18n from 'licia/I18n'
import defaults from 'licia/defaults'
import isDataUrl from 'licia/isDataUrl'
import enUS from '../../common/locales/en-US.json'
import zhCN from '../../common/locales/zh-CN.json'

export const i18n = new I18n('en-US', {
  'en-US': enUS,
  'zh-CN': defaults(zhCN, enUS),
})

export function t(path: string | string[], data?: types.PlainObj<any>) {
  return i18n.t(path, data)
}

export function getSystemLanguage() {
  if (navigator.language === 'zh-CN') {
    return 'zh-CN'
  }

  return 'en-US'
}

export function isDev() {
  return import.meta.env.MODE === 'development'
}

export async function splitImage(url: string, num: number) {
  const images: string[] = []
  const img = await getImageSize(url)
  let colNum = 1
  while (colNum * colNum < num) {
    colNum++
  }
  const rowNum = Math.ceil(num / colNum)
  let i = 0
  const width = Math.round(img.width / colNum)
  const height = Math.round(img.height / rowNum)
  for (let row = 0; row < rowNum; row++) {
    for (let col = 0; col < colNum; col++) {
      if (i < num) {
        const x = col * width
        const y = row * height
        images[i] = getClippedRegion(img, x, y, width, height)
      }
      i++
    }
  }
  return images
}

export function getImageSize(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    loadImg(url, function (err, img) {
      if (err) {
        return reject(err)
      }

      resolve(img)
    })
  })
}

function getClippedRegion(image, x, y, width, height) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = width
  canvas.height = height

  ctx!.drawImage(image, x, y, width, height, 0, 0, width, height)

  return canvas.toDataURL().slice('data:image/png;base64,'.length)
}

export function toDataUrl(data: string, mime: string) {
  if (isDataUrl(data)) {
    return data
  }

  return `data:${mime};base64,${data}`
}
