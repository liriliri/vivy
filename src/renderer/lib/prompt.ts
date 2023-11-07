import map from 'licia/map'
import trim from 'licia/trim'
import remove from 'licia/remove'
import contain from 'licia/contain'
import rtrim from 'licia/rtrim'

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
  return rtrim(prompt, ', ') + ', ' + tag
}

export function rmTag(prompt: string, tag: string) {
  const lines = map(prompt.split('\n'), (line) => {
    const tags = line.split(',')
    remove(tags, (t) => hasTag(t, tag))
    return tags.join(',')
  })

  return lines.join('\n')
}

export function toggleTag(prompt: string, tag: string) {
  return hasTag(prompt, tag) ? rmTag(prompt, tag) : addTag(prompt, tag)
}

export function hasTag(prompt: string, tag: string) {
  if (!contain(prompt, tag)) {
    return false
  }
  const reg = new RegExp(`\\b${tag}\\b`)
  return reg.test(prompt)
}
