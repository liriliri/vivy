import map from 'licia/map'
import trim from 'licia/trim'

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

    return line
  })

  return lines.join('\n')
}
