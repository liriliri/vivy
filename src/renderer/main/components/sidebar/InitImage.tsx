import { observer } from 'mobx-react-lite'
import Style from './InitImage.module.scss'
import openFile from 'licia/openFile'
import store from '../../store'
import className from 'licia/className'
import toBool from 'licia/toBool'
import ImageViewer from 'luna-image-viewer'
import { toDataUrl, t, isFileDrop, notify } from '../../../lib/util'
import LunaImageViewer from 'luna-image-viewer/react'
import LunaToolbar, {
  LunaToolbarSeparator,
  LunaToolbarSpace,
} from 'luna-toolbar/react'
import ToolbarIcon from '../../../components/ToolbarIcon'
import { useCallback, useRef, useState } from 'react'
import ImageInfoModal from '../common/ImageInfoModal'
import InterrogateModal from '../common/InterrogateModal'
import contextMenu from '../../../lib/contextMenu'

export default observer(function InitImage() {
  const initImageRef = useRef<HTMLDivElement>(null)
  const imageViewerRef = useRef<ImageViewer>()
  const [imageInfoModalVisible, setImageInfoModalVisible] = useState(false)
  const [interrogateModalVisible, setInterrogateModalVisible] = useState(false)
  const [dropHighlight, setDropHighlight] = useState(false)
  const [resizerStyle, setResizerStyle] = useState<any>({
    height: '10px',
  })

  const openInitImage = () => {
    openFile({
      accept: 'image/png,image/jpeg',
    }).then(async (fileList) => {
      const file = fileList[0]
      if (file) {
        store.setInitImage(file)
      }
    })
  }

  const pasteInitImage = async () => {
    const image = await main.readClipboardImage()
    if (image) {
      store.setInitImage(image, 'image/png')
    } else {
      notify(t('noClipboardImage'))
    }
  }

  const onContextMenu = (e: React.MouseEvent) => {
    contextMenu(e, [
      {
        label: t('paste'),
        click() {
          pasteInitImage()
        },
      },
    ])
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

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const startY = e.clientY
    const height = initImageRef.current!.offsetHeight
    setResizerStyle({
      position: 'fixed',
      width: '100%',
      height: '100%',
    })

    const onMouseMove = (e: MouseEvent) => {
      const deltaY = startY - e.clientY
      initImageRef.current!.style.height = `${height - deltaY}px`
    }

    const onMouseUp = (e: MouseEvent) => {
      setResizerStyle({
        height: '10px',
      })
      const deltaY = startY - e.clientY
      store.ui.set('initImageHeight', height - deltaY)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [])

  if (!store.initImage) {
    return (
      <div
        className={className(Style.empty, 'button', {
          [Style.highlight]: dropHighlight,
        })}
        onClick={openInitImage}
        onContextMenu={onContextMenu}
        onDrop={onDrop}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
      >
        {t('setImage')}
      </div>
    )
  } else {
    return (
      <div
        className={Style.initImage}
        ref={initImageRef}
        style={{
          height: store.ui.initImageHeight,
        }}
      >
        <div
          className={Style.resizer}
          style={resizerStyle}
          onMouseDown={onMouseDown}
        />
        <LunaToolbar className={Style.toolbar}>
          <ToolbarIcon
            icon="open-file"
            title={t('openImage')}
            onClick={openInitImage}
          />
          <ToolbarIcon
            icon="paste"
            title={t('paste')}
            onClick={pasteInitImage}
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
          <LunaToolbarSeparator />
          <ToolbarIcon
            icon="color-palette"
            title={t('sketch')}
            onClick={() => main.showSketch()}
          />
          <ToolbarIcon
            icon="magic"
            title={t('interrogate')}
            onClick={() => setInterrogateModalVisible(true)}
          />
          <LunaToolbarSpace />
          <ToolbarIcon
            icon="delete"
            title={t('delete')}
            onClick={() => {
              store.deleteInitImage()
              main.closeSketch()
            }}
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
        <InterrogateModal
          visible={interrogateModalVisible}
          image={store.initImage}
          onClose={() => setInterrogateModalVisible(false)}
        />
      </div>
    )
  }
})
