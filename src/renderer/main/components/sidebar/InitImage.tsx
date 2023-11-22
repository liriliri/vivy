import { observer } from 'mobx-react-lite'
import Style from './InitImage.module.scss'
import openFile from 'licia/openFile'
import store from '../../store'
import className from 'licia/className'
import toBool from 'licia/toBool'
import ImageViewer from 'luna-image-viewer'
import { toDataUrl, t, isFileDrop } from '../../../lib/util'
import LunaImageViewer from 'luna-image-viewer/react'
import LunaToolbar, {
  LunaToolbarSeparator,
  LunaToolbarSpace,
} from 'luna-toolbar/react'
import ToolbarIcon from '../../../components/ToolbarIcon'
import { useRef, useState } from 'react'
import ImageInfoModal from '../common/ImageInfoModal'

export default observer(function InitImage() {
  const imageViewerRef = useRef<ImageViewer>()
  const [imageInfoModalVisible, setImageInfoModalVisible] = useState(false)
  const [dropHighlight, setDropHighlight] = useState(false)

  const openInitImage = () => {
    openFile({
      accept: 'image/png',
    }).then(async (fileList) => {
      const file = fileList[0]
      if (file) {
        store.setInitImage(file)
      }
    })
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDropHighlight(false)
    if (isFileDrop(e)) {
      store.setInitImage(e.dataTransfer.files[0])
    } else {
      const id = e.dataTransfer.getData('imageId')
      if (id) {
        const image = store.getImage(id)
        if (image) {
          store.setInitImage(image)
        }
      }
    }
  }

  const onDragLeave = () => setDropHighlight(false)

  const onDragOver = (e) => {
    e.preventDefault()
    setDropHighlight(true)
  }

  if (!store.initImage) {
    return (
      <div
        className={className(Style.empty, {
          [Style.highlight]: dropHighlight,
        })}
        onClick={openInitImage}
        onDrop={onDrop}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
      >
        {t('setImage')}
      </div>
    )
  } else {
    return (
      <div className={Style.initImage}>
        <LunaToolbar className={Style.toolbar}>
          <ToolbarIcon
            icon="open-file"
            title={t('openImage')}
            onClick={openInitImage}
          />
          <ToolbarIcon
            icon="info"
            title={t('imageInfo')}
            onClick={() => setImageInfoModalVisible(true)}
            disabled={!toBool(store.initImage?.info.prompt)}
          />
          <LunaToolbarSeparator />
          <ToolbarIcon
            icon="reset"
            title={t('reset')}
            onClick={() => imageViewerRef.current?.reset()}
          />
          <LunaToolbarSpace />
          <ToolbarIcon
            icon="delete"
            title={t('delete')}
            onClick={() => store.deleteInitImage()}
          />
        </LunaToolbar>
        <div
          className={className(Style.imageViewer, {
            [Style.highlight]: dropHighlight,
          })}
          onDrop={onDrop}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
        >
          <LunaImageViewer
            image={toDataUrl(store.initImage.data, store.initImage.info.mime)}
            onCreate={(imageViewer) => (imageViewerRef.current = imageViewer)}
          ></LunaImageViewer>
        </div>
        <ImageInfoModal
          visible={imageInfoModalVisible}
          image={store.initImage}
          onClose={() => setImageInfoModalVisible(false)}
        />
      </div>
    )
  }
})
