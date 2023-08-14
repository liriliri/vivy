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
  const image = `data:image/png;base64,${data}`
  const size = await getImageSize(image)
  console.log('image size', size)
}

function getImageSize(image: string) {
  return new Promise((resolve, reject) => {
    loadImg(image, function (err, img) {
      if (err) {
        return reject(err)
      }

      resolve({
        width: img.width,
        height: img.height,
      })
    })
  })
}

function getClippedRegion(image, x, y, width, height) {
  let canvas = document.createElement('canvas')
  let ctx = canvas.getContext('2d')

  canvas.width = width
  canvas.height = height

  ctx!.drawImage(image, x, y, width, height, 0, 0, width, height)

  return canvas
}
