import Painter, { Zoom, Hand } from 'luna-painter'
import { IImage } from '../../main/store/types'
import { setMemStore, toDataUrl } from '../../lib/util'
import debounce from 'licia/debounce'
import LunaPainter from 'luna-painter/react'

export default function Sketch() {
  const onCreate = async (painter: Painter) => {
    const initImage: IImage = await main.getMemStore('initImage')
    const { width, height } = initImage.info
    painter.setOption('width', width)
    painter.setOption('height', height)
    const zoom = painter.getTool('zoom') as Zoom
    zoom.fitScreen()
    const hand = painter.getTool('hand') as Hand
    hand.centerCanvas()

    const image = new Image()
    image.onload = function () {
      const ctx = painter.getActiveLayer().getContext()
      ctx.drawImage(image, 0, 0, width, height)
      const idx = painter.addLayer()
      painter.activateLayer(idx)
      painter.renderCanvas()
    }
    image.src = toDataUrl(initImage.data, initImage.info.mime)

    painter.renderCanvas()

    painter.on(
      'canvasRender',
      debounce(async () => {
        const dataUrl = painter.getCanvas().toDataURL(initImage.info.mime)
        const data = dataUrl.slice(dataUrl.indexOf('base64,') + 7)
        initImage.data = data
        setMemStore('initImage', initImage)
      }, 1000)
    )
  }

  return <LunaPainter width={512} height={512} onCreate={onCreate} />
}
