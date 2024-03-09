import types from 'licia/types'
import loadImg from 'licia/loadImg'
import convertBin from 'licia/convertBin'
import I18n from 'licia/I18n'
import defaults from 'licia/defaults'
import isDataUrl from 'licia/isDataUrl'
import suggestions from '../assets/suggestions.txt?raw'
import each from 'licia/each'
import map from 'licia/map'
import trim from 'licia/trim'
import startWith from 'licia/startWith'
import h from 'licia/h'
import contain from 'licia/contain'
import isArrBuffer from 'licia/isArrBuffer'
import enUS from '../../common/langs/en-US.json'
import zhCN from '../../common/langs/zh-CN.json'
import suggestionsZhCN from '../assets/suggestions-zh-CN.txt?raw'
import LunaNotification, { INotifyOptions } from 'luna-notification'

const suggestionsZhCNLines = suggestionsZhCN.split('\n')

each(suggestionsZhCNLines, (line) => {
  const [key, translation] = line.split(',')
  zhCN[`suggestion-${key}`] = translation
})

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

function getClippedRegion(image, x, y, width, height) {
  const canvas = getTmpCanvas()
  const ctx = canvas.getContext('2d')
  canvas.width = width
  canvas.height = height

  ctx!.drawImage(image, x, y, width, height, 0, 0, width, height)

  const { data } = parseDataUrl(canvas.toDataURL())

  return data
}

export function parseDataUrl(dataUrl: string) {
  const data = dataUrl.slice(dataUrl.indexOf('base64,') + 7)

  return {
    data,
  }
}

export function toDataUrl(data: string, mime: string) {
  if (isDataUrl(data)) {
    return data
  }

  return `data:${mime};base64,${data}`
}

const suggestionLines = suggestions.split('\n')
const suggestionDict = {}
each(suggestionLines, (line) => {
  line = trim(line)
  if (!line) {
    return
  }
  const arr = suggestionDict[line[0]] || []
  arr.push(line)
  suggestionDict[line[0]] = arr
})

export function getSuggestions(str: string, maxCount = 5) {
  const c = str[0]
  const arr = suggestionDict[c]
  if (!arr) {
    return []
  }

  const result: Array<string[]> = []
  for (let i = 0, len = arr.length; i < len; i++) {
    const word = arr[i]
    if (startWith(word, str)) {
      result.push(word.split(','))
      if (result.length >= maxCount) {
        break
      }
    } else if (result.length > 0) {
      break
    }
  }

  return map(
    result.sort((a, b) => +b[1] - +a[1]),
    (w) => w[0]
  )
}

export function searchTags(str: string, maxCount = 100) {
  const tags: string[] = []

  for (let i = 0, len = suggestionsZhCNLines.length; i < len; i++) {
    const line = suggestionsZhCNLines[i]
    if (contain(line, str)) {
      tags.push(line.split(',')[0])
    }
    if (tags.length >= maxCount) {
      break
    }
  }

  return tags
}

let notification: LunaNotification | null = null

export function notify(content: string, options?: INotifyOptions) {
  if (!notification) {
    const div = h('div')
    document.body.appendChild(div)
    notification = new LunaNotification(div, {
      position: {
        x: 'center',
        y: 'top',
      },
    })
  }

  notification.notify(content, options)
}

export function isFileDrop(e: React.DragEvent) {
  return contain(e.dataTransfer.types, 'Files')
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
