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
import Style from './ImageViewer.module.scss'
import className from 'licia/className'
import convertBin from 'licia/convertBin'
import ToolbarIcon from '../../../components/ToolbarIcon'
import defaultImage from '../../../assets/img/default.png'
import defaultDarkImage from '../../../assets/img/default-dark.png'
import { parseDataUrl, t, toDataUrl } from '../../../lib/util'
import { getImageName } from '../../lib/util'
import ImageInfoModal from '../common/ImageInfoModal'
import InterrogateModal from '../common/InterrogateModal'
import PreprocessModal from '../common/PreprocessModal'
import CropModal from '../common/CropModal'
import UpscaleModal from './UpscaleModal'
import FaceRestorationModal from './FaceRestorationModal'
import contextMenu from '../../../lib/contextMenu'

export default observer(function () {
  const { project } = store
  const imageViewerRef = useRef<ImageViewer>()
  const [imageInfoModalVisible, setImageInfoModalVisible] = useState(false)
  const [upscaleModalVisible, setUpscaleModalVisible] = useState(false)
  const [faceRestorationModalVisible, setFaceRestorationModalVisible] =
    useState(false)
  const [proprocessModalVisible, setProprocessModalVisible] = useState(false)
  const [interrogateModalVisible, setInterrogateModalVisible] = useState(false)
  const [cropModalVisible, setCropModalVisible] = useState(false)

  const save = () => {
    if (project.selectedImage) {
      const { selectedImage } = project
      const blob = convertBin(selectedImage.data, 'Blob')
      download(blob, getImageName(selectedImage), selectedImage.info.mime)
    }
  }

  const deleteImage = () => {
    if (project.selectedImage) {
      project.deleteImage(project.selectedImage)
    }
  }

  const onCrop = (canvas: HTMLCanvasElement) => {
    const { data } = parseDataUrl(canvas.toDataURL('image/png'))
    store.project.addFiles([convertBin(data, 'Blob')])
  }

  const onContextMenu = (e: React.MouseEvent) => {
    const imageViewer = imageViewerRef.current!

    const template: any[] = [
      {
        label: t('reset'),
        click: () => imageViewer.reset(),
      },
      {
        label: t('rotateLeft'),
        click: () => imageViewer.rotate(-90),
      },
      {
        label: t('rotateRight'),
        click: () => imageViewer.rotate(90),
      },
    ]

    contextMenu(e, template)
  }

  let image = store.theme === 'dark' ? defaultDarkImage : defaultImage
  if (project.selectedImage) {
    image = toDataUrl(project.selectedImage.data, 'image/png')
  }

  const arrowLeft = (
    <div className={Style.arrowLeft} onClick={() => project.selectPrevImage()}>
      <span
        className={className(Style.iconArrowLeft, 'icon-arrow-left')}
      ></span>
    </div>
  )

  const arrowRight = (
    <div className={Style.arrowRight} onClick={() => project.selectNextImage()}>
      <span
        className={className(Style.iconArrowRight, 'icon-arrow-right')}
      ></span>
    </div>
  )

  const hasArrow = project.selectedImage && project.images.length > 1
  const hasSelectedImage = toBool(project.selectedImage)

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
        <ToolbarIcon
          icon="info"
          title={t('imageInfo')}
          onClick={() => setImageInfoModalVisible(true)}
          disabled={!toBool(project.selectedImage?.info.prompt)}
        />
        <LunaToolbarSeparator />
        <ToolbarIcon
          icon="crop"
          title={t('crop')}
          disabled={!hasSelectedImage}
          onClick={() => setCropModalVisible(true)}
        />
        <ToolbarIcon
          icon="resize-image"
          title={t('upscale')}
          disabled={!hasSelectedImage}
          onClick={() => setUpscaleModalVisible(true)}
        />
        <ToolbarIcon
          icon="face"
          title={t('faceRestoration')}
          disabled={!hasSelectedImage}
          onClick={() => setFaceRestorationModalVisible(true)}
        />
        <ToolbarIcon
          icon="explode"
          title={t('preprocess')}
          disabled={!hasSelectedImage}
          onClick={() => setProprocessModalVisible(true)}
        />
        <ToolbarIcon
          icon="magic"
          title={t('interrogate')}
          disabled={!hasSelectedImage}
          onClick={() => setInterrogateModalVisible(true)}
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
      <div className={Style.body} onContextMenu={onContextMenu}>
        <LunaImageViewer
          className={Style.body}
          image={image}
          onCreate={(imageViewer) => (imageViewerRef.current = imageViewer)}
        ></LunaImageViewer>
      </div>
      {hasArrow && arrowLeft}
      {hasArrow && arrowRight}
      {project.selectedImage && (
        <ImageInfoModal
          visible={imageInfoModalVisible}
          image={project.selectedImage}
          onClose={() => setImageInfoModalVisible(false)}
        />
      )}
      {project.selectedImage && (
        <InterrogateModal
          visible={interrogateModalVisible}
          image={project.selectedImage}
          onClose={() => setInterrogateModalVisible(false)}
        />
      )}
      {project.selectedImage && (
        <UpscaleModal
          visible={upscaleModalVisible}
          image={project.selectedImage}
          onClose={() => setUpscaleModalVisible(false)}
        />
      )}
      {project.selectedImage && (
        <FaceRestorationModal
          visible={faceRestorationModalVisible}
          image={project.selectedImage}
          onClose={() => setFaceRestorationModalVisible(false)}
        />
      )}
      {project.selectedImage && (
        <PreprocessModal
          visible={proprocessModalVisible}
          image={project.selectedImage}
          onClose={() => setProprocessModalVisible(false)}
        />
      )}
      {project.selectedImage && (
        <CropModal
          visible={cropModalVisible}
          image={project.selectedImage}
          onCrop={onCrop}
          onClose={() => setCropModalVisible(false)}
        />
      )}
    </div>
  )
})
