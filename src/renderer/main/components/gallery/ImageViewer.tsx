import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'
import store from '../../store'
import LunaImageViewer from 'luna-image-viewer'
import LunaToolbar from 'luna-toolbar'
import download from 'licia/download'
import mime from 'licia/mime'
import Style from './ImageViewer.module.scss'
import convertBin from 'licia/convertBin'
import { autorun } from 'mobx'
import { toolbarIcon } from '../../../lib/luna'
import defaultImage from '../../../assets/img/default.png'

export default observer(function () {
  const bodyRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  let imageViewer: LunaImageViewer

  useEffect(() => {
    const toolbar = new LunaToolbar(toolbarRef.current as HTMLDivElement)
    const save = toolbar.appendHtml(
      toolbarIcon(
        'save',
        () => {
          if (store.selectedImage) {
            const { selectedImage } = store
            const blob = convertBin(selectedImage.data, 'Blob')
            download(blob, `image-${selectedImage.id}.png`, mime('png'))
          }
        },
        'Save'
      )
    )
    toolbar.appendSeparator()
    toolbar.appendHtml(toolbarIcon('reset', () => imageViewer.reset(), 'Reset'))
    toolbar.appendHtml(
      toolbarIcon('zoom-in', () => imageViewer.zoom(0.1), 'Zoom In')
    )
    toolbar.appendHtml(
      toolbarIcon('zoom-out', () => imageViewer.zoom(-0.1), 'Zoom Out')
    )
    toolbar.appendHtml(
      toolbarIcon('rotate-left', () => imageViewer.rotate(-90), 'Rotate Left')
    )
    toolbar.appendHtml(
      toolbarIcon('rotate-right', () => imageViewer.rotate(90), 'Rotate Right')
    )
    toolbar.appendSpace()
    toolbar.appendSeparator()
    const deleteBtn = toolbar.appendHtml(
      toolbarIcon(
        'delete',
        () => {
          if (store.selectedImage) {
            store.deleteImage(store.selectedImage)
          }
        },
        'Delete'
      )
    )
    autorun(() => {
      if (!store.selectedImage) {
        save.disable()
        deleteBtn.disable()
      } else {
        save.enable()
        deleteBtn.enable()
      }
    })
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
      } else {
        imageViewer.setOption('image', defaultImage)
      }
    })
    return () => imageViewer.destroy()
  }, [])

  return (
    <div className={Style.imageViewer}>
      <div className={Style.toolbar} ref={toolbarRef}></div>
      <div className={Style.body} ref={bodyRef}></div>
    </div>
  )
})
