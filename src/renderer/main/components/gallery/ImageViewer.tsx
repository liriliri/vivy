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
import { t, toDataUrl } from '../../../lib/util'
import ImageInfoModal from '../common/ImageInfoModal'
import InterrogateModal from '../common/InterrogateModal'
import UpscaleModal from './UpscaleModal'
import { IImage } from '../../../main/store/types'
import slugify from 'licia/slugify'
import truncate from 'licia/truncate'

export default observer(function () {
  const { project } = store
  const imageViewerRef = useRef<ImageViewer>()
  const [imageInfoModalVisible, setImageInfoModalVisible] = useState(false)
  const [upscaleModalVisible, setUpscaleModalVisible] = useState(false)
  const [interrogateModalVisible, setInterrogateModalVisible] = useState(false)

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

  let image = store.settings.theme === 'light' ? defaultImage : defaultDarkImage
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
          icon="reset"
          title={t('reset')}
          onClick={() => imageViewerRef.current?.reset()}
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
          onClick={() => setUpscaleModalVisible(true)}
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
      <LunaImageViewer
        className={Style.body}
        image={image}
        onCreate={(imageViewer) => (imageViewerRef.current = imageViewer)}
      ></LunaImageViewer>
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
      <UpscaleModal
        visible={upscaleModalVisible}
        onClose={() => setUpscaleModalVisible(false)}
      />
    </div>
  )
})

export function getImageName(image: IImage) {
  const ext = image.info.mime === 'image/jpeg' ? '.jpg' : '.png'

  if (image.info.prompt && image.info.seed) {
    const name = truncate(image.info.prompt, 100, {
      ellipsis: '',
      separator: ',',
    })
    return `${slugify(name)}-${image.info.seed}${ext}`
  }

  return `${image.id}${ext}`
}
