import types from 'licia/types'
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
import enUS from '../../common/langs/en-US.json'
import zhCN from '../../common/langs/zh-CN.json'
import suggestionsZhCN from '../assets/suggestions-zh-CN.txt?raw'
import LunaNotification, { INotifyOptions } from 'luna-notification'
import { isObservable, toJS } from 'mobx'
import detectOs from 'licia/detectOs'

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

export async function setMainStore(name: string, val: any) {
  await main.setMainStore(name, isObservable(val) ? toJS(val) : val)
}

export async function setMemStore(name: string, val: any) {
  await main.setMemStore(name, isObservable(val) ? toJS(val) : val)
}

export function getPlatform() {
  const os = detectOs()
  if (os === 'os x') {
    return 'mac'
  }
  return os
}
