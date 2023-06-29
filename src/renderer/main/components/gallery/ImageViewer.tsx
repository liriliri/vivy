import { observer } from 'mobx-react-lite'
import { ReactPortal, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import store from '../../store'
import LunaImageViewer from 'luna-image-viewer'
import LunaModal from 'luna-modal'
import LunaToolbar from 'luna-toolbar'
import download from 'licia/download'
import h from 'licia/h'
import mime from 'licia/mime'
import Style from './ImageViewer.module.scss'
import convertBin from 'licia/convertBin'
import { autorun } from 'mobx'
import { toolbarIcon } from '../../../lib/luna'
import defaultImage from '../../../assets/img/default.png'
import { i18n } from '../../../lib/util'

export default observer(function () {
  const bodyRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const infoModalRef = useRef<HTMLDivElement>(null)
  const [infoModalContent] = useState(h(`div.${Style.imageInfo}`))

  let imageViewer: LunaImageViewer
  let infoModal: LunaModal

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
    const info = toolbar.appendHtml(
      toolbarIcon(
        'info',
        () => {
          infoModal.show()
        },
        i18n.t('imageInfo')
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
        if (store.selectedImage.info) {
          info.enable()
        } else {
          info.disable()
        }
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

  useEffect(() => {
    infoModal = new LunaModal(infoModalRef.current as HTMLDivElement, {
      title: i18n.t('imageInfo'),
      width: 640,
      content: infoModalContent,
    })
  }, [])

  let infoModalContentPortal: ReactPortal | null = null

  if (store.selectedImage?.info) {
    const info = store.selectedImage.info
    infoModalContentPortal = createPortal(
      <>
        <div>{info.prompt}</div>
        <div>{info.negativePrompt}</div>
      </>,
      infoModalContent
    )
  }

  return (
    <div className={Style.imageViewer}>
      <div className={Style.toolbar} ref={toolbarRef}></div>
      <div className={Style.body} ref={bodyRef}></div>
      {createPortal(<div ref={infoModalRef}></div>, document.body)}
      {infoModalContentPortal}
    </div>
  )
})
