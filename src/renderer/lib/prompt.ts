import map from 'licia/map'
import each from 'licia/each'
import trim from 'licia/trim'
import remove from 'licia/remove'
import contain from 'licia/contain'
import rtrim from 'licia/rtrim'
import isEmpty from 'licia/isEmpty'

export function format(prompt: string) {
  const lines = map(prompt.split('\n'), (line) => {
    line = trim(line)

    line = line
      .replace(/【/g, '[')
      .replace(/】/g, ']')
      .replace(/（/g, '(')
      .replace(/）/g, ')')
      .replace(/\s*([()[\]:<>])\s*/g, ($0, $1) => $1)
      .replace(/\s+/g, ' ')
      .replace(/\s*[,，]\s*/g, ', ')
      .replace(/([)\]>])([([<])/g, ($0, $1, $2) => `${$1}, ${$2}`)
      .replace(/(\w)([([<])/g, ($0, $1, $2) => `${$1} ${$2}`)
      .replace(/([)\]>])(\w)/g, ($0, $1, $2) => `${$1} ${$2}`)

    return trim(line, ', ')
  })

  return lines.join('\n')
}

export function addTag(prompt: string, tag: string) {
  prompt = rtrim(prompt, ', \n')
  return prompt + (isEmpty(prompt) ? '' : ', ') + tag
}

export function split(prompt: string) {
  const lines = prompt.split('\n')
  const result: Array<string[]> = []
  each(lines, (line) => {
    const lineTags: string[] = []
    const tags = line.split(',')
    let tag = ''
    for (let i = 0, len = tags.length; i < len; i++) {
      const t = tags[i]
      tag += tag ? `,${t}` : t
      if (isValidTag(tag)) {
        lineTags.push(tag)
        tag = ''
      }
    }
    result.push(lineTags)
  })
  return result
}

export function join(lines: Array<string[]>) {
  return map(lines, (line) => line.join(',')).join('\n')
}

function isValidTag(tag: string) {
  const brackets = {
    '(': 0,
    '[': 0,
    '<': 0,
  }
  function check(c, left, right) {
    if (c === left) {
      brackets[left]++
    } else if (c === right) {
      brackets[left]--
    }
  }
  for (let i = 0, len = tag.length; i < len; i++) {
    const c = tag[i]
    check(c, '(', ')')
    check(c, '[', ']')
    check(c, '<', '>')
  }

  let sum = 0
  each(brackets, (count) => (sum += count))

  return sum === 0
}

export function rmTag(prompt: string, tag: string) {
  const lines = split(prompt)
  each(lines, (tags) => {
    remove(tags, (t) => hasTag(t, tag))
  })
  return join(lines)
}

export function toggleTag(prompt: string, tag: string) {
  return hasTag(prompt, tag) ? rmTag(prompt, tag) : addTag(prompt, tag)
}

export function hasTag(prompt: string, tag: string) {
  if (!contain(prompt, tag)) {
    return false
  }
  if (/[^\w]/.test(tag)) {
    return true
  }

  const reg = new RegExp(`\\b${tag}\\b`)
  return reg.test(prompt)
}
