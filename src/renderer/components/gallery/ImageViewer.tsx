import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'
import store from '../../store'
import LunaImageViewer from 'luna-image-viewer'
import './ImageViewer.scss'
import { autorun } from 'mobx'

export default observer(function () {
  const imageViewerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const imageViewer = new LunaImageViewer(
      imageViewerRef.current as HTMLDivElement,
      { image: '' }
    )
    autorun(() => {
      if (store.selectedImage) {
        imageViewer.setOption('image', store.selectedImage.data)
      }
    })
    return () => imageViewer.destroy()
  }, [])

  return <div id="image-viewer" ref={imageViewerRef}></div>
})
