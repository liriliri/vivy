import { observer } from 'mobx-react-lite'
import { useRef, useState } from 'react'
import store from '../../store'
import LunaImageViewer from 'luna-image-viewer/react'
import ImageViewer from 'luna-image-viewer'
import LunaToolbar, {
  LunaToolbarHtml,
  LunaToolbarSeparator,
  LunaToolbarSpace,
} from 'luna-toolbar/react'
import download from 'licia/download'
import toBool from 'licia/toBool'
import mime from 'licia/mime'
import Style from './ImageViewer.module.scss'
import className from 'licia/className'
import convertBin from 'licia/convertBin'
import ToolbarIcon from '../../../components/ToolbarIcon'
import defaultImage from '../../../assets/img/default.png'
import defaultDarkImage from '../../../assets/img/default-dark.png'
import { t, toDataUrl } from '../../../lib/util'
import InfoModal from './InfoModal'
import CopyButton from '../../../components/CopyButton'

export default observer(function () {
  const imageViewerRef = useRef<ImageViewer>()
  const [infoModalVisible, setInfoModalVisible] = useState(false)

  const save = () => {
    if (store.selectedImage) {
      const { selectedImage } = store
      const blob = convertBin(selectedImage.data, 'Blob')
      download(blob, `image-${selectedImage.id}.png`, mime('png'))
    }
  }

  const deleteImage = () => {
    if (store.selectedImage) {
      store.deleteImage(store.selectedImage)
    }
  }

  const copyImage = () => {
    const image = store.selectedImage
    if (image) {
      const mime = image.info.mime
      const buf = convertBin(image.data, 'ArrayBuffer')
      navigator.clipboard.write([
        new ClipboardItem({
          [mime]: new Blob([buf], {
            type: mime,
          }),
        }),
      ])
    }
  }

  let image = store.settings.theme === 'light' ? defaultImage : defaultDarkImage
  if (store.selectedImage) {
    image = toDataUrl(store.selectedImage.data, 'image/png')
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

  const hasArrow = store.selectedImage && store.images.length > 1
  const hasSelectedImage = toBool(store.selectedImage)

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
          disabled={!hasSelectedImage}
        />
        <LunaToolbarHtml disabled={!hasSelectedImage}>
          <CopyButton onClick={copyImage} />
        </LunaToolbarHtml>
        <ToolbarIcon
          icon="info"
          title={t('imageInfo')}
          onClick={() => setInfoModalVisible(true)}
          disabled={!toBool(store.selectedImage?.info.prompt)}
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
        <LunaToolbarSeparator />
        <ToolbarIcon
          icon="resize-image"
          title={t('upscale')}
          disabled={!hasSelectedImage}
          onClick={() => {}}
        />
        <LunaToolbarSpace />
        <ToolbarIcon
          icon="delete"
          title={t('delete')}
          onClick={deleteImage}
          disabled={!hasSelectedImage}
        />
        <LunaToolbarSeparator />
        <ToolbarIcon
          icon={store.ui.imageViewerMaximized ? 'shrink' : 'fullscreen'}
          title={t(store.ui.imageViewerMaximized ? 'restore' : 'maximize')}
          onClick={() => {
            store.ui.set('imageViewerMaximized', !store.ui.imageViewerMaximized)
          }}
        />
      </LunaToolbar>
      <LunaImageViewer
        className={Style.body}
        image={image}
        onCreate={(imageViewer) => (imageViewerRef.current = imageViewer)}
      ></LunaImageViewer>
      {hasArrow ? arrowLeft : null}
      {hasArrow ? arrowRight : null}
      <InfoModal
        visible={infoModalVisible}
        onClose={() => setInfoModalVisible(false)}
      />
    </div>
  )
})
