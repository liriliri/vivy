import { observer } from 'mobx-react-lite'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import store from '../../store'
import LunaImageViewer from 'luna-image-viewer'
import LunaModal from 'luna-modal/react'
import LunaToolbar from 'luna-toolbar'
import download from 'licia/download'
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
  const [infoModalVisible, setInfoModalVisible] = useState(false)

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
    const info = toolbar.appendHtml(
      toolbarIcon(
        'info',
        () => {
          setInfoModalVisible(true)
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

  let infoModalContent: JSX.Element | null = null

  if (store.selectedImage?.info) {
    const info = store.selectedImage.info
    infoModalContent = (
      <>
        <div>{info.prompt}</div>
        <div>{info.negativePrompt}</div>
      </>
    )
  }

  return (
    <div className={Style.imageViewer}>
      <div className={Style.toolbar} ref={toolbarRef}></div>
      <div className={Style.body} ref={bodyRef}></div>
      {createPortal(
        <LunaModal
          title={i18n.t('imageInfo')}
          visible={infoModalVisible}
          width={640}
          onClose={() => setInfoModalVisible(false)}
        >
          {infoModalContent}
        </LunaModal>,
        document.body
      )}
    </div>
  )
})
