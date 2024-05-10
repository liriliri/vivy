import { observer } from 'mobx-react-lite'
import Style from './InitImage.module.scss'
import openFile from 'licia/openFile'
import store from '../../store'
import className from 'licia/className'
import toBool from 'licia/toBool'
import ImageViewer from 'luna-image-viewer'
import {
  t,
  notify,
  toDataUrl,
  isFileDrop,
  parseDataUrl,
} from '../../../lib/util'
import { copyData } from '../../lib/util'
import LunaImageViewer from 'luna-image-viewer/react'
import LunaToolbar, {
  LunaToolbarSeparator,
  LunaToolbarSpace,
} from 'luna-toolbar/react'
import ToolbarIcon from '../../../components/ToolbarIcon'
import { useCallback, useRef, useState } from 'react'
import ImageInfoModal from '../common/ImageInfoModal'
import InterrogateModal from '../common/InterrogateModal'
import CropModal from '../common/CropModal'
import contextMenu from '../../../lib/contextMenu'
import convertBin from 'licia/convertBin'
import NewImageModal from './NewImageModal'
import { toJS } from 'mobx'

export default observer(function InitImage() {
  const { project } = store

  const initImageRef = useRef<HTMLDivElement>(null)
  const imageViewerRef = useRef<ImageViewer>()
  const [imageInfoModalVisible, setImageInfoModalVisible] = useState(false)
  const [interrogateModalVisible, setInterrogateModalVisible] = useState(false)
  const [cropModalVisible, setCropModalVisible] = useState(false)
  const [newImageModalVisible, setNewImageModalVisible] = useState(false)
  const [dropHighlight, setDropHighlight] = useState(false)
  const [resizerStyle, setResizerStyle] = useState<any>({
    height: '10px',
  })

  const open = () => {
    openFile({
      accept: 'image/png,image/jpeg',
    }).then(async (fileList) => {
      const file = fileList[0]
      if (file) {
        project.setInitImage(file)
      }
    })
  }

  const paste = async () => {
    const image = await main.readClipboardImage()
    if (image) {
      project.setInitImage(image, 'image/png')
    } else {
      notify(t('noClipboardImage'))
    }
  }

  const importMask = () => {
    openFile({
      accept: 'image/png,image/jpeg',
    }).then(async (fileList) => {
      const file = fileList[0]
      if (file) {
        const buf = await convertBin.blobToArrBuffer(file)
        project.setInitImageMask(
          toDataUrl(convertBin(buf, 'base64'), file.type)
        )
      }
    })
  }

  const onContextMenu = (e: React.MouseEvent) => {
    contextMenu(e, [
      {
        label: t('new'),
        click() {
          setNewImageModalVisible(true)
        },
      },
      {
        label: t('paste'),
        click: paste,
      },
    ])
  }

  const onImageContextMenu = (e: React.MouseEvent) => {
    const imageViewer = imageViewerRef.current!

    const template: any[] = [
      {
        label: t('reset'),
        click: () => imageViewer.reset(),
      },
      {
        label: t('originalSize'),
        click: () => imageViewer.zoomTo(1),
      },
      {
        label: t('rotateLeft'),
        click: () => imageViewer.rotate(-90),
      },
      {
        label: t('rotateRight'),
        click: () => imageViewer.rotate(90),
      },
      {
        type: 'separator',
      },
      {
        label: t('copy'),
        click() {
          const image = project.initImage!
          copyData(image.data, image.info.mime)
        },
      },
      {
        label: t('paste'),
        click: paste,
      },
      {
        type: 'separator',
      },
      {
        label: t('importMask'),
        click: importMask,
      },
    ]

    if (project.initImageMask) {
      template.push({
        label: t('deleteMask'),
        click() {
          project.deleteInitImageMask()
        },
      })
    }

    contextMenu(e, template)
  }

  const onCrop = (canvas: HTMLCanvasElement) => {
    const { data } = parseDataUrl(canvas.toDataURL('image/png'))
    store.project.updateInitImage(data, {
      width: canvas.width,
      height: canvas.height,
    })
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDropHighlight(false)
    if (isFileDrop(e)) {
      project.setInitImage(e.dataTransfer.files[0])
    } else {
      const id = e.dataTransfer.getData('imageId')
      if (id) {
        const image = project.getImage(id)
        if (image) {
          project.setInitImage(toJS(image))
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

  if (!project.initImage) {
    return (
      <>
        <div
          className={className(Style.empty, 'button', {
            [Style.highlight]: dropHighlight,
          })}
          onClick={open}
          onContextMenu={onContextMenu}
          onDrop={onDrop}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
        >
          {t('setImage')}
        </div>
        <NewImageModal
          visible={newImageModalVisible}
          onClose={() => setNewImageModalVisible(false)}
        />
      </>
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
          <ToolbarIcon icon="open-file" title={t('openImage')} onClick={open} />
          <ToolbarIcon
            icon="info"
            title={t('imageInfo')}
            onClick={() => setImageInfoModalVisible(true)}
            disabled={!toBool(project.initImage?.info.prompt)}
          />
          <LunaToolbarSeparator />
          <ToolbarIcon
            icon="color-palette"
            title={t('sketch')}
            onClick={() => main.showPainter('sketch')}
          />
          <ToolbarIcon
            icon="mask"
            title={t('mask')}
            onClick={() => main.showPainter('mask')}
          />
          <ToolbarIcon
            icon="crop"
            title={t('crop')}
            onClick={() => setCropModalVisible(true)}
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
              project.deleteInitImage()
              main.closePainter()
            }}
          />
        </LunaToolbar>
        <div
          className={className(Style.imageViewer, {
            [Style.highlight]: dropHighlight,
          })}
          onContextMenu={onImageContextMenu}
          onDrop={onDrop}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
        >
          <LunaImageViewer
            image={project.initImagePreview!}
            onCreate={(imageViewer) => (imageViewerRef.current = imageViewer)}
          ></LunaImageViewer>
        </div>
        <ImageInfoModal
          visible={imageInfoModalVisible}
          image={project.initImage}
          onClose={() => setImageInfoModalVisible(false)}
        />
        <InterrogateModal
          visible={interrogateModalVisible}
          image={project.initImage}
          onClose={() => setInterrogateModalVisible(false)}
        />
        <CropModal
          visible={cropModalVisible}
          image={project.initImage}
          onCrop={onCrop}
          onClose={() => setCropModalVisible(false)}
        />
      </div>
    )
  }
})
