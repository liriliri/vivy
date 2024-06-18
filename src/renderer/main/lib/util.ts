import { IImage } from '../../main/store/types'
import truncate from 'licia/truncate'
import loadImg from 'licia/loadImg'
import convertBin from 'licia/convertBin'
import isArrBuffer from 'licia/isArrBuffer'
import { slugifyFileName } from '../../lib/util'
import isFile from 'licia/isFile'
import isStr from 'licia/isStr'
import fileType from 'licia/fileType'
import startWith from 'licia/startWith'
import { parseImage } from './genData'
import uuid from 'licia/uuid'
import dataUrl from 'licia/dataUrl'

export function getImageName(image: IImage) {
  const ext = image.info.mime === 'image/jpeg' ? '.jpg' : '.png'

  if (image.info.prompt && image.info.seed) {
    const name = truncate(image.info.prompt, 100, {
      ellipsis: '',
      separator: ',',
    })
    return `${slugifyFileName(name)}-${image.info.seed}${ext}`
  }

  return `${image.id}${ext}`
}

export function blurAll() {
  const tmp = document.createElement('input')
  document.body.appendChild(tmp)
  tmp.focus()
  document.body.removeChild(tmp)
}

export async function splitImage(url: string, num: number) {
  const images: string[] = []
  const img = await loadImage(url)
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

function getClippedRegion(image, x, y, width, height) {
  const canvas = getTmpCanvas()
  const ctx = canvas.getContext('2d')
  canvas.width = width
  canvas.height = height

  ctx!.drawImage(image, x, y, width, height, 0, 0, width, height)

  const { data } = dataUrl.parse(canvas.toDataURL())!

  return data
}

let canvas: HTMLCanvasElement

function getTmpCanvas() {
  if (!canvas) {
    canvas = document.createElement('canvas')
  }

  return canvas
}

export async function renderImageMask(base: string, mask: string) {
  const maskImage = await loadImage(mask)
  const baseImage = await loadImage(base)

  const { width, height } = baseImage
  const canvas = getTmpCanvas()
  const ctx = canvas.getContext('2d')!
  canvas.width = width
  canvas.height = height
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.filter = 'invert(1)'
  ctx.globalAlpha = 0.8
  ctx.drawImage(maskImage, 0, 0, width, height)
  ctx.filter = 'none'
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'multiply'
  ctx.drawImage(baseImage, 0, 0, width, height)
  ctx.globalCompositeOperation = 'source-over'

  return canvas.toDataURL()
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    loadImg(url, function (err, img) {
      if (err) {
        return reject(err)
      }

      resolve(img)
    })
  })
}

export function createImage(width: number, height: number) {
  const canvas = getTmpCanvas()
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  return canvas.toDataURL()
}

export async function isEmptyMask(mask: string) {
  const image = await loadImage(mask)
  const { width, height } = image
  const canvas = getTmpCanvas()
  const ctx = canvas.getContext('2d')!
  canvas.width = width
  canvas.height = height
  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(image, 0, 0, width, height)

  const { data } = ctx.getImageData(0, 0, width, height)
  for (let i = 0, len = data.length; i < len; i += 4) {
    if (data[i] + data[i + 1] + data[i + 2] !== 0) {
      return false
    }
  }

  return true
}

export function copyData(buf: any, mime: string) {
  if (!isArrBuffer(buf)) {
    buf = convertBin(buf, 'ArrayBuffer')
  }
  navigator.clipboard.write([
    new ClipboardItem({
      [mime]: new Blob([buf], {
        type: mime,
      }),
    }),
  ])
}

export async function toImage(data: IImage | Blob | string, mime = '') {
  let buf = new ArrayBuffer(0)
  if (isFile(data)) {
    buf = await convertBin.blobToArrBuffer(data)
  } else if (isStr(data)) {
    buf = convertBin(data, 'ArrayBuffer')
  }
  if (buf.byteLength > 0) {
    if (!mime) {
      const type = fileType(buf)
      if (type) {
        mime = type.mime
      }
    }

    if (!startWith(mime, 'image/')) {
      return
    }

    const base64Data = convertBin(buf, 'base64')
    const imageInfo = await parseImage(base64Data, mime)
    return {
      id: uuid(),
      data: base64Data,
      info: {
        size: buf.byteLength,
        mime,
        ...imageInfo,
      },
    } as IImage
  } else {
    return data as IImage
  }
}
