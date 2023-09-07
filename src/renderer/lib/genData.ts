import { getImageSize, toDataUrl } from './util'
import trim from 'licia/trim'
import map from 'licia/map'
import startWith from 'licia/startWith'

interface IGenData {
  negativePrompt?: string
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

export function parseText(text: string): IClipboardGenData {
  text = trim(text)
  let prompt = ''
  let negativePrompt = ''
  let doneWithPrompt = false

  const lines = map(text.split('\n'), (line) => trim(line))
  lines.pop()

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
