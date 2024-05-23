import { toDataUrl } from '../../lib/util'
import { loadImage } from './util'
import trim from 'licia/trim'
import map from 'licia/map'
import toNum from 'licia/toNum'
import startWith from 'licia/startWith'
import contain from 'licia/contain'
import convertBin from 'licia/convertBin'
import filter from 'licia/filter'
import extend from 'licia/extend'
import bytesToStr from 'licia/bytesToStr'
import extract from 'png-chunks-extract'
import replaceAll from 'licia/replaceAll'
import exifr from 'exifr'
import each from 'licia/each'

interface IGenData {
  negativePrompt?: string
  steps?: number
  seed?: number
  sampler?: string
  scheduler?: string
  cfgScale?: number
  model?: string
  clipSkip?: number
}

export interface ISDGenData extends IGenData {
  prompt: string
  width?: number
  height?: number
}

export interface IImageGenData extends IGenData {
  prompt?: string
  width: number
  height: number
}

export function parseText(text: string): ISDGenData {
  text = trim(text)
  text = replaceAll(text, '\u0000', '')

  if (startWith(text, 'parameters')) {
    return parseA1111(text)
  }

  if (startWith(text, 'sd-metadata')) {
    return parseInvokeAI(text)
  }

  return parseA1111(text)
}

const regPrompt = /^(.*?)\[(.*?)\]$/

function parseInvokeAI(text: string): ISDGenData {
  text = trimStarts(text, ['sd-metadata'])
  const { image } = JSON.parse(text)

  let prompt = image.prompt
  let negativePrompt = ''
  const match = prompt.match(regPrompt)
  if (match) {
    prompt = trim(match[1])
    negativePrompt = trim(match[2])
  }

  return {
    prompt,
    negativePrompt,
    width: image.width,
    height: image.height,
    cfgScale: image.cfg_scale,
    sampler: image.sampler,
    seed: image.seed,
    steps: image.steps,
  }
}

const regParam = /\s*([\w ]+):\s*("(?:\\.|[^\\"])+"|[^,]*)(?:,|$)/g

function parseA1111(text: string): ISDGenData {
  text = trimStarts(text, ['parameters', 'UNICODE'])
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

  if (matches.length < 2) {
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

  const genData: ISDGenData = {
    prompt: trim(prompt),
  }

  if (negativePrompt) {
    genData.negativePrompt = trim(negativePrompt)
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
        case 'Clip skip':
          genData.clipSkip = toNum(val)
          break
        case 'Model':
          genData.model = val
          break
        case 'Schedule type':
          genData.scheduler = val
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
  const { width, height } = await loadImage(toDataUrl(data, mime))
  const genData: IImageGenData = {
    width,
    height,
  }

  const buf = convertBin(data, 'Uint8Array')
  if (mime === 'image/png') {
    let chunks = filter(extract(buf), (chunk: any) =>
      contain(['tEXt', 'iTXt'], chunk.name)
    )
    chunks = map(chunks, (chunk) => {
      if (chunk.name === 'iTXt') {
        return bytesToStr(chunk.data)
      }

      return bytesToStr(chunk.data, 'latin1')
    })

    for (let i = 0, len = chunks.length; i < len; i++) {
      const chunk = chunks[i]
      if (startWith(chunk, 'parameters')) {
        extend(genData, parseText(chunk))
        break
      }
      if (startWith(chunk, 'sd-metadata')) {
        extend(genData, parseText(chunk))
      }
    }
  } else if (mime === 'image/jpeg') {
    const exif = await exifr.parse(buf, ['UserComment'])
    if (exif && exif.userComment) {
      extend(genData, parseText(bytesToStr(exif.userComment)))
    }
  }

  return genData
}

function trimStarts(text, starts: string[]) {
  each(starts, (start) => {
    if (startWith(text, start)) {
      text = text.slice(start.length)
    }
  })

  return text
}
