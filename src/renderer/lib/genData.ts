import { getImageSize, toDataUrl } from './util'

interface IGenData {
  prompt?: string
  negativePrompt?: string
}

interface IClipboardGenData extends IGenData {
  width?: number
  height?: number
}

interface IImageGenData extends IGenData {
  width: number
  height: number
}

export function parseClipboard(): IClipboardGenData {
  return {}
}

export async function parseImage(
  data: string,
  mime: string
): Promise<IImageGenData> {
  const { width, height } = await getImageSize(toDataUrl(data, mime))

  return {
    width,
    height,
  }
}
