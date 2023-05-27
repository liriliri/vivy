import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'
import store from '../../store'
import LunaImageViewer from 'luna-image-viewer'
import LunaToolbar from 'luna-toolbar'
import './ImageViewer.scss'
import { autorun } from 'mobx'
import { createToolbarIcon } from '../../lib/luna'

export default observer(function () {
  const bodyRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  let imageViewer: LunaImageViewer

  useEffect(() => {
    const toolbar = new LunaToolbar(toolbarRef.current as HTMLDivElement)
    toolbar.appendHtml(
      createToolbarIcon('zoom-in', () => imageViewer.zoom(0.1))
    )
    toolbar.appendHtml(
      createToolbarIcon('zoom-out', () => imageViewer.zoom(-0.1))
    )
    return () => toolbar.destroy()
  }, [])

  useEffect(() => {
    imageViewer = new LunaImageViewer(bodyRef.current as HTMLDivElement, {
      image: '',
    })
    autorun(() => {
      if (store.selectedImage) {
        imageViewer.setOption('image', store.selectedImage.data)
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
