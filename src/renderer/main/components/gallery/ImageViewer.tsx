import { observer } from 'mobx-react-lite'
import { useRef, useState } from 'react'
import store from '../../store'
import LunaImageViewer from 'luna-image-viewer/react'
import ImageViewer from 'luna-image-viewer'
import LunaToolbar, {
  LunaToolbarSeparator,
  LunaToolbarSpace,
} from 'luna-toolbar/react'
import download from 'licia/download'
import toBool from 'licia/toBool'
import mime from 'licia/mime'
import Style from './ImageViewer.module.scss'
import className from 'licia/className'
import convertBin from 'licia/convertBin'
import ToolbarIcon from '../common/ToolbarIcon'
import defaultImage from '../../../assets/img/default.png'
import defaultDarkImage from '../../../assets/img/default-dark.png'
import { t } from '../../../lib/util'
import InfoModal from './InfoModal'

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

  let image = store.settings.theme === 'light' ? defaultImage : defaultDarkImage
  if (store.selectedImage) {
    image = `data:image/png;base64,${store.selectedImage.data}`
  }

  const arrowLeft = (
    <div className={Style.arrowLeft} onClick={() => store.selectPrevImage()}>
      <span
        className={className(Style.iconArrowLeft, 'icon-arrow-left')}
      ></span>
    </div>
  )

  const arrowRight = (
    <div className={Style.arrowRight} onClick={() => store.selectNextImage()}>
      <span
        className={className(Style.iconArrowRight, 'icon-arrow-right')}
      ></span>
    </div>
  )

  return (
    <div
      className={className(Style.imageViewer, {
        'full-mode': store.ui.imageViewerMaximized,
      })}
    >
      <LunaToolbar className={Style.toolbar}>
        <ToolbarIcon
          icon="save"
          title={t('save')}
          onClick={save}
          disabled={!toBool(store.selectedImage)}
        />
        <LunaToolbarSeparator />
        <ToolbarIcon
          icon="info"
          title={t('imageInfo')}
          onClick={() => setInfoModalVisible(true)}
          disabled={!toBool(store.selectedImage?.info)}
        />
        <LunaToolbarSeparator />
        <ToolbarIcon
          icon="reset"
          title={t('reset')}
          onClick={() => imageViewerRef.current?.reset()}
        />
        <ToolbarIcon
          icon="zoom-in"
          title={t('zoomIn')}
          onClick={() => imageViewerRef.current?.zoom(0.1)}
        />
        <ToolbarIcon
          icon="zoom-out"
          title={t('zoomOut')}
          onClick={() => imageViewerRef.current?.zoom(-0.1)}
        />
        <ToolbarIcon
          icon="rotate-left"
          title={t('rotateLeft')}
          onClick={() => imageViewerRef.current?.rotate(-90)}
        />
        <ToolbarIcon
          icon="rotate-right"
          title={t('rotateRight')}
          onClick={() => imageViewerRef.current?.rotate(90)}
        />
        <LunaToolbarSpace />
        <ToolbarIcon
          icon="fullscreen"
          title={t('maximize')}
          onClick={() => {
            store.setUi('imageViewerMaximized', !store.ui.imageViewerMaximized)
          }}
        />
        <LunaToolbarSeparator />
        <ToolbarIcon
          icon="delete"
          title={t('delete')}
          onClick={deleteImage}
          disabled={!toBool(store.selectedImage)}
        />
      </LunaToolbar>
      <LunaImageViewer
        className={Style.body}
        image={image}
        onCreate={(imageViewer) => (imageViewerRef.current = imageViewer)}
      ></LunaImageViewer>
      {store.selectedImage ? arrowLeft : null}
      {store.selectedImage ? arrowRight : null}
      <InfoModal
        visible={infoModalVisible}
        onClose={() => setInfoModalVisible(false)}
      />
    </div>
  )
})
