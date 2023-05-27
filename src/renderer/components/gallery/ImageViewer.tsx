import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'
import store from '../../store'
import LunaImageViewer from 'luna-image-viewer'
import LunaToolbar from 'luna-toolbar'
import download from 'licia/download'
import mime from 'licia/mime'
import './ImageViewer.scss'
import convertBin from 'licia/convertBin'
import { autorun } from 'mobx'
import { toolbarIcon, toolbarSpace } from '../../lib/luna'

export default observer(function () {
  const bodyRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  let imageViewer: LunaImageViewer

  useEffect(() => {
    const toolbar = new LunaToolbar(toolbarRef.current as HTMLDivElement)
    toolbar.appendHtml(toolbarIcon('reset', () => imageViewer.reset()))
    toolbar.appendHtml(toolbarIcon('zoom-in', () => imageViewer.zoom(0.1)))
    toolbar.appendHtml(toolbarIcon('zoom-out', () => imageViewer.zoom(-0.1)))
    toolbar.appendHtml(
      toolbarIcon('rotate-left', () => imageViewer.rotate(-90))
    )
    toolbar.appendHtml(
      toolbarIcon('rotate-right', () => imageViewer.rotate(90))
    )
    toolbarSpace(toolbar)
    toolbar.appendHtml(
      toolbarIcon('save', () => {
        if (store.selectedImage) {
          const { selectedImage } = store
          const blob = convertBin(selectedImage.data, 'Blob')
          download(blob, `image-${selectedImage.id}.png`, mime('png'))
        }
      })
    )
    return () => toolbar.destroy()
  }, [])

  useEffect(() => {
    imageViewer = new LunaImageViewer(bodyRef.current as HTMLDivElement, {
      image: '',
    })
    autorun(() => {
      if (store.selectedImage) {
        imageViewer.setOption(
          'image',
          `data:image/png;base64,${store.selectedImage.data}`
        )
      }
    })
    return () => imageViewer.destroy()
  }, [])

  return (
    <div id="image-viewer">
      <div className="image-viewer-toolbar toolbar" ref={toolbarRef}></div>
      <div className="image-viewer-body" ref={bodyRef}></div>
    </div>
  )
})
