import types from 'licia/types'
import suggestions from '../assets/suggestions.txt?raw'
import each from 'licia/each'
import map from 'licia/map'
import trim from 'licia/trim'
import startWith from 'licia/startWith'
import h from 'licia/h'
import contain from 'licia/contain'
import suggestionsZhCN from '../assets/suggestions-zh-CN.txt?raw'
import LunaNotification, { INotifyOptions } from 'luna-notification'
import { isObservable, toJS } from 'mobx'
import slugify from 'licia/slugify'
import isWindows from 'licia/isWindows'
import { i18n } from '../../common/util'

const suggestionsZhCNLines = suggestionsZhCN.split('\n')

const suggestionZhCN: types.PlainObj<string> = {}
each(suggestionsZhCNLines, (line) => {
  const [key, translation] = line.split(',')
  suggestionZhCN[`suggestion-${key}`] = translation
})

i18n.set('zh-CN', suggestionZhCN)

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

export function slugifyFileName(name: string) {
  let ret = slugify(name)

  if (isWindows) {
    ret = ret.replace(/[/\\:*?"<>]/g, '-')
  }

  return ret
}
