import I18n from 'licia/I18n'
import types from 'licia/types'
import extend from 'licia/extend'
import loadImg from 'licia/loadImg'
import en from '../locales/en.json'
import zhCN from '../locales/zh-CN.json'

export async function invokeMain(api, ...args) {
  return await (window as any).main[api](...args)
}

export function ipcOnEvent(event: string, cb: types.AnyFn) {
  ;(window as any).preload.ipcOnEvent(event, cb)
}

export function isDev() {
  return import.meta.env.MODE === 'development'
}

export const i18n = new I18n('en', {
  en,
  zhCN: extend(en, zhCN),
})

switch (navigator.language) {
  case 'zh-CN':
    i18n.locale('zhCN')
    break
  default:
    i18n.locale('en')
}

export async function splitImage(data: string, num: number) {
  const images: string[] = []
  const image = `data:image/png;base64,${data}`
  const img = await getImageSize(image)
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

function getImageSize(image: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    loadImg(image, function (err, img) {
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
