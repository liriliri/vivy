import { IImage } from '../../main/store/types'
import slugify from 'licia/slugify'
import truncate from 'licia/truncate'

export function getImageName(image: IImage) {
  const ext = image.info.mime === 'image/jpeg' ? '.jpg' : '.png'

  if (image.info.prompt && image.info.seed) {
    const name = truncate(image.info.prompt, 100, {
      ellipsis: '',
      separator: ',',
    })
    return `${slugify(name)}-${image.info.seed}${ext}`
  }

  return `${image.id}${ext}`
}
