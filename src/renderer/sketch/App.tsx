import LunaPainter from 'luna-painter/react'
import Painter from 'luna-painter'
import { IImage } from '../main/store/types'
import { toDataUrl } from '../lib/util'
import debounce from 'licia/debounce'
import Style from './App.module.scss'

export default function App() {
  const onCreate = async (painter: Painter) => {
    const initImage: IImage = await main.getMainStore('initImage')
    const { width, height } = initImage.info
    painter.setOption('width', width)
    painter.setOption('height', height)

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
        await main.setMainStore('initImage', initImage)
      }, 1000)
    )
  }

  return (
    <div className={Style.container}>
      <LunaPainter
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        width={512}
        height={512}
        onCreate={onCreate}
      />
    </div>
  )
}
