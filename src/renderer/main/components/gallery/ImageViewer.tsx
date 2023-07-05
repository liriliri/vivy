import { observer } from 'mobx-react-lite'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import store from '../../store'
import LunaImageViewer from 'luna-image-viewer'
import LunaModal from 'luna-modal/react'
import LunaToolbar, {
  LunaToolbarSeparator,
  LunaToolbarSpace,
} from 'luna-toolbar/react'
import download from 'licia/download'
import toBool from 'licia/toBool'
import mime from 'licia/mime'
import Style from './ImageViewer.module.scss'
import convertBin from 'licia/convertBin'
import { autorun } from 'mobx'
import ToolbarIcon from '../common/ToolbarIcon'
import defaultImage from '../../../assets/img/default.png'
import { i18n } from '../../../lib/util'

export default observer(function () {
  const bodyRef = useRef<HTMLDivElement>(null)
  const [infoModalVisible, setInfoModalVisible] = useState(false)

  let imageViewer: LunaImageViewer

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

  function save() {
    if (store.selectedImage) {
      const { selectedImage } = store
      const blob = convertBin(selectedImage.data, 'Blob')
      download(blob, `image-${selectedImage.id}.png`, mime('png'))
    }
  }

  function deleteImage() {
    if (store.selectedImage) {
      store.deleteImage(store.selectedImage)
    }
  }

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
      <LunaToolbar className={Style.toolbar}>
        <ToolbarIcon
          icon="save"
          title="Save"
          onClick={save}
          disabled={!toBool(store.selectedImage)}
        />
        <LunaToolbarSeparator />
        <ToolbarIcon
          icon="info"
          title={i18n.t('imageInfo')}
          onClick={() => setInfoModalVisible(true)}
          disabled={!toBool(store.selectedImage?.info)}
        />
        <LunaToolbarSeparator />
        <ToolbarIcon
          icon="reset"
          title="Reset"
          onClick={() => imageViewer.reset()}
        />
        <ToolbarIcon
          icon="zoom-in"
          title="Zoom In"
          onClick={() => imageViewer.zoom(0.1)}
        />
        <ToolbarIcon
          icon="zoom-out"
          title="Zoom Out"
          onClick={() => imageViewer.zoom(-0.1)}
        />
        <ToolbarIcon
          icon="rotate-left"
          title="Rotate Left"
          onClick={() => imageViewer.rotate(-90)}
        />
        <ToolbarIcon
          icon="rotate-right"
          title="Rotate Right"
          onClick={() => imageViewer.rotate(90)}
        />
        <LunaToolbarSpace />
        <LunaToolbarSeparator />
        <ToolbarIcon
          icon="delete"
          title="Delete"
          onClick={deleteImage}
          disabled={!toBool(store.selectedImage)}
        />
      </LunaToolbar>
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
