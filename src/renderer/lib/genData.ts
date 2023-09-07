import { getImageSize, toDataUrl } from './util'
import trim from 'licia/trim'
import map from 'licia/map'
import toNum from 'licia/toNum'
import startWith from 'licia/startWith'
import contain from 'licia/contain'

interface IGenData {
  negativePrompt?: string
  steps?: number
  seed?: number
  sampler?: string
  cfgScale?: number
  model?: string
}

interface IClipboardGenData extends IGenData {
  prompt: string
  width?: number
  height?: number
}

interface IImageGenData extends IGenData {
  prompt?: string
  width: number
  height: number
}

const regParam = /\s*([\w ]+):\s*("(?:\\.|[^\\"])+"|[^,]*)(?:,|$)/g

export function parseText(text: string): IClipboardGenData {
  text = trim(text)
  let prompt = ''
  let negativePrompt = ''
  let doneWithPrompt = false

  const lines = map(text.split('\n'), (line) => trim(line))
  let lastLine = lines.pop() || ''

  const matchesIterator = lastLine.matchAll(regParam)
  const matches: RegExpMatchArray[] = []
  for (const match of matchesIterator) {
    matches.push(match)
  }

  if (matches.length < 3) {
    if (lastLine) {
      lines.push(lastLine)
      lastLine = ''
    }
  }

  for (let i = 0, len = lines.length; i < len; i++) {
    let line = lines[i]
    if (startWith(line, 'Negative prompt:')) {
      doneWithPrompt = true
      line = line.slice('Negative prompt:'.length)
    }
    if (doneWithPrompt) {
      negativePrompt += (negativePrompt === '' ? '' : '\n') + line
    } else {
      prompt += (prompt === '' ? '' : '\n') + line
    }
  }

  const genData: IClipboardGenData = {
    prompt,
  }

  if (negativePrompt) {
    genData.negativePrompt = negativePrompt
  }

  if (matches) {
    for (let i = 0, len = matches.length; i < len; i++) {
      const match = matches[i]
      const key = match[1]
      const val = trim(match[2], '"')
      switch (key) {
        case 'Steps':
          genData.steps = toNum(val)
          break
        case 'Seed':
          genData.seed = toNum(val)
          break
        case 'Sampler':
          genData.sampler = val
          break
        case 'CFG scale':
          genData.cfgScale = toNum(val)
          break
        case 'Model':
          genData.model = val
          break
        case 'Size':
          if (contain(val, 'x')) {
            const vals = val.split('x')
            genData.width = toNum(vals[0])
            genData.height = toNum(vals[1])
          }
          break
      }
    }
  }

  return genData
}

export async function parseImage(
  data: string,
  mime: string
): Promise<IImageGenData> {
  const { width, height } = await getImageSize(toDataUrl(data, mime))
  const genData: IImageGenData = {
    width,
    height,
  }

  return genData
}
