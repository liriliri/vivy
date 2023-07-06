import { observer } from 'mobx-react-lite'
import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import store from '../../store'
import LunaImageViewer from 'luna-image-viewer/react'
import ImageViewer from 'luna-image-viewer'
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
import ToolbarIcon from '../common/ToolbarIcon'
import defaultImage from '../../../assets/img/default.png'
import { i18n } from '../../../lib/util'

export default observer(function () {
  const imageViewerRef = useRef<ImageViewer>()
  const [infoModalVisible, setInfoModalVisible] = useState(false)

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

  let image = defaultImage
  if (store.selectedImage) {
    image = `data:image/png;base64,${store.selectedImage.data}`
  }

  return (
    <div className={Style.imageViewer}>
      <LunaToolbar className={Style.toolbar}>
        <ToolbarIcon
          icon="save"
          title={i18n.t('save')}
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
          title={i18n.t('reset')}
          onClick={() => imageViewerRef.current?.reset()}
        />
        <ToolbarIcon
          icon="zoom-in"
          title={i18n.t('zoomIn')}
          onClick={() => imageViewerRef.current?.zoom(0.1)}
        />
        <ToolbarIcon
          icon="zoom-out"
          title={i18n.t('zoomOut')}
          onClick={() => imageViewerRef.current?.zoom(-0.1)}
        />
        <ToolbarIcon
          icon="rotate-left"
          title={i18n.t('rotateLeft')}
          onClick={() => imageViewerRef.current?.rotate(-90)}
        />
        <ToolbarIcon
          icon="rotate-right"
          title={i18n.t('rotateRight')}
          onClick={() => imageViewerRef.current?.rotate(90)}
        />
        <LunaToolbarSpace />
        <LunaToolbarSeparator />
        <ToolbarIcon
          icon="delete"
          title={i18n.t('delete')}
          onClick={deleteImage}
          disabled={!toBool(store.selectedImage)}
        />
      </LunaToolbar>
      <LunaImageViewer
        className={Style.body}
        image={image}
        onCreate={(imageViewer) => (imageViewerRef.current = imageViewer)}
      ></LunaImageViewer>
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
