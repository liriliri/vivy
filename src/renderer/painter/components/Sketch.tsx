import Painter, { Zoom, Hand } from 'luna-painter'
import { IImage } from '../../main/store/types'
import { setMemStore } from 'share/renderer/lib/util'
import debounce from 'licia/debounce'
import LunaPainter from 'luna-painter/react'
import dataUrl from 'licia/dataUrl'

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
    image.src = dataUrl.stringify(initImage.data, initImage.info.mime)

    painter.renderCanvas()

    painter.on(
      'renderCanvas',
      debounce(async () => {
        initImage.data = dataUrl.parse(
          painter.getCanvas().toDataURL(initImage.info.mime)
        )!.data
        setMemStore('initImage', initImage)
      }, 1000)
    )
  }

  return <LunaPainter width={512} height={512} onCreate={onCreate} />
}
