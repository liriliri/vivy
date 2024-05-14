import { observer } from 'mobx-react-lite'
import LunaTab, { LunaTabItem } from 'luna-tab/react'
import Style from './ControlNet.module.scss'
import map from 'licia/map'
import store from '../../store'
import { useRef, useState } from 'react'
import toStr from 'licia/toStr'
import { isFileDrop, notify, t, toDataUrl } from '../../../lib/util'
import toNum from 'licia/toNum'
import { Row } from '../../../components/setting'
import className from 'licia/className'
import InitImageStyle from './InitImage.module.scss'
import { toJS } from 'mobx'
import LunaImageViewer from 'luna-image-viewer/react'
import LunaToolbar, {
  LunaToolbarSeparator,
  LunaToolbarSpace,
} from 'luna-toolbar/react'
import ToolbarIcon from '../../../components/ToolbarIcon'
import openFile from 'licia/openFile'
import ImageViewer from 'luna-image-viewer'
import contextMenu from '../../../lib/contextMenu'
import { copyData } from '../../lib/util'
import PreprocessModal from '../common/PreprocessModal'

export default observer(function ControlNet() {
  const { controlNetUnits } = store.project
  const [selectedUnit, setSelectedUnit] = useState(controlNetUnits[0])
  const [dropHighlight, setDropHighlight] = useState(false)
  const [preprocessModalVisible, setPreprocessModalVisible] = useState(false)
  const imageViewerRef = useRef<ImageViewer>()

  const tabItems = map(controlNetUnits, (unit, idx) => {
    return (
      <LunaTabItem
        key={idx}
        id={toStr(idx)}
        title={`${t('controlNetUnit')} ${idx + 1}`}
        selected={unit === selectedUnit}
      />
    )
  })

  const openImage = () => {
    openFile({
      accept: 'image/png,image/jpeg',
    }).then(async (fileList) => {
      const file = fileList[0]
      if (file) {
        selectedUnit.setImage(file)
      }
    })
  }

  const pasteImage = async () => {
    const image = await main.readClipboardImage()
    if (image) {
      selectedUnit.setImage(image, 'image/png')
    } else {
      notify(t('noClipboardImage'))
    }
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
          const image = selectedUnit.image!
          copyData(image.data, image.info.mime)
        },
      },
      {
        label: t('paste'),
        click: pasteImage,
      },
    ]

    contextMenu(e, template)
  }

  const onImageDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDropHighlight(false)
    if (isFileDrop(e)) {
      selectedUnit.setImage(e.dataTransfer.files[0])
    } else {
      const id = e.dataTransfer.getData('imageId')
      if (id) {
        const image = store.project.getImage(id)
        if (image) {
          selectedUnit.setImage(toJS(image))
        }
      }
    }
  }

  const onImageDragLeave = () => {
    setDropHighlight(false)
  }

  const onImageDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDropHighlight(true)
  }

  let image = (
    <div
      className={className(InitImageStyle.empty, 'button', {
        [InitImageStyle.highlight]: dropHighlight,
      })}
      onClick={openImage}
      onContextMenu={(e: React.MouseEvent) => {
        contextMenu(e, [
          {
            label: t('paste'),
            click: pasteImage,
          },
        ])
      }}
      onDrop={onImageDrop}
      onDragLeave={onImageDragLeave}
      onDragOver={onImageDragOver}
    >
      {t('setImage')}
    </div>
  )

  if (selectedUnit.image) {
    image = (
      <div
        className={InitImageStyle.initImage}
        style={{
          height: 200,
        }}
      >
        <LunaToolbar className={InitImageStyle.toolbar}>
          <ToolbarIcon
            icon="open-file"
            title={t('openImage')}
            onClick={openImage}
          />
          <LunaToolbarSeparator />
          <ToolbarIcon
            icon="explode"
            title={t('preprocess')}
            onClick={() => setPreprocessModalVisible(true)}
          />
          <LunaToolbarSpace />
          <ToolbarIcon
            icon="delete"
            title={t('delete')}
            onClick={() => {
              selectedUnit.deleteImage()
              main.closePainter()
            }}
          />
        </LunaToolbar>
        <div
          className={className(InitImageStyle.imageViewer, {
            [InitImageStyle.highlight]: dropHighlight,
          })}
          onContextMenu={onImageContextMenu}
          onDrop={onImageDrop}
          onDragLeave={onImageDragLeave}
          onDragOver={onImageDragOver}
        >
          <LunaImageViewer
            image={toDataUrl(
              selectedUnit.image.data,
              selectedUnit.image.info.mime
            )}
            onCreate={(imageViewer) => (imageViewerRef.current = imageViewer)}
          ></LunaImageViewer>
        </div>
        <PreprocessModal
          visible={preprocessModalVisible}
          image={selectedUnit.image}
          onClose={() => setPreprocessModalVisible(false)}
        />
      </div>
    )
  }

  return (
    <>
      <LunaTab
        className={Style.tab}
        height={30}
        onSelect={(idx) => setSelectedUnit(controlNetUnits[toNum(idx)])}
      >
        {tabItems}
      </LunaTab>
      <Row>{image}</Row>
    </>
  )
})
