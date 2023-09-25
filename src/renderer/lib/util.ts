import types from 'licia/types'
import loadImg from 'licia/loadImg'
import I18n from 'licia/I18n'
import defaults from 'licia/defaults'
import isDataUrl from 'licia/isDataUrl'
import suggestions from '../assets/suggestions.txt?raw'
import each from 'licia/each'
import map from 'licia/map'
import trim from 'licia/trim'
import startWith from 'licia/startWith'
import enUS from '../../common/langs/en-US.json'
import zhCN from '../../common/langs/zh-CN.json'
import suggestionsZhCN from '../assets/suggestions-zh-CN.txt?raw'

each(suggestionsZhCN.split('\n'), (line) => {
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
