import { observer } from 'mobx-react-lite'
import each from 'licia/each'
import className from 'licia/className'
import isEmpty from 'licia/isEmpty'
import LunaToolbar, {
  LunaToolbarSeparator,
  LunaToolbarSpace,
} from 'luna-toolbar/react'
import store from '../../store'
import openFile from 'licia/openFile'
import { IImage } from '../../store/types'
import { TaskStatus } from '../../store/task'
import Style from './ImageList.module.scss'
import { t, toDataUrl } from '../../../lib/util'
import ToolbarIcon from '../../../components/ToolbarIcon'
import { useCallback, useRef, useState } from 'react'
import LunaModal from 'luna-modal'

export default observer(function () {
  const imageListRef = useRef<HTMLDivElement>(null)
  const [resizerStyle, setResizerStyle] = useState<any>({
    height: '10px',
  })
  const [dropHighlight, setDropHighlight] = useState(false)

  const itemStyle = getItemStyle()
  const images: JSX.Element[] = []

  each(store.images, (image) => {
    images.push(Image(image))
  })

  each(store.tasks, (task) => {
    each(task.images, (image) => {
      let content: JSX.Element | null = null
      if (image.data) {
        content = (
          <>
            <div className={Style.mask}></div>
            <div className={Style.progress}>{task.progress}%</div>
            <img src={toDataUrl(image.data, 'image/png')} draggable={false} />
          </>
        )
      } else {
        if (task.status === TaskStatus.Wait) {
          content = <span className="icon-image"></span>
        } else {
          content = <div className={Style.progress}>{task.progress}%</div>
        }
      }
      images.push(
        <div className={Style.item} key={image.id} style={itemStyle}>
          {content}
        </div>
      )
    })
  })

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDropHighlight(false)
    store.addFiles(e.dataTransfer.files)
  }

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const startY = e.clientY
    const height = imageListRef.current!.offsetHeight
    setResizerStyle({
      position: 'fixed',
      width: '100%',
      height: '100%',
    })

    const onMouseMove = (e: MouseEvent) => {
      const deltaY = startY - e.clientY
      imageListRef.current!.style.height = `${height + deltaY}px`
    }

    const onMouseUp = (e: MouseEvent) => {
      setResizerStyle({
        height: '10px',
      })
      const deltaY = startY - e.clientY
      store.ui.set('imageListHeight', height + deltaY)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [])

  return (
    <div
      className={className(Style.imageList, {
        'full-mode': store.ui.imageListMaximized,
      })}
      style={{
        height: store.ui.imageListHeight,
      }}
      ref={imageListRef}
    >
      <div
        className={Style.resizer}
        style={resizerStyle}
        onMouseDown={onMouseDown}
      ></div>
      <LunaToolbar className={Style.toolbar}>
        <ToolbarIcon
          icon="open-file"
          title={t('openImage')}
          onClick={() => {
            openFile({
              accept: 'image/png',
              multiple: true,
            }).then(async (fileList) => store.addFiles(fileList as any))
          }}
        />
        <LunaToolbarSeparator />
        <ToolbarIcon
          icon="zoom-in"
          title={t('zoomIn')}
          disabled={store.ui.imageListItemSize > 250 || isEmpty(images)}
          onClick={() => {
            const itemSize = Math.round(store.ui.imageListItemSize * 1.1)
            store.ui.set('imageListItemSize', itemSize)
          }}
        />
        <ToolbarIcon
          icon="zoom-out"
          title={t('zoomOut')}
          disabled={store.ui.imageListItemSize < 50 || isEmpty(images)}
          onClick={() => {
            const itemSize = Math.round(store.ui.imageListItemSize * 0.9)
            store.ui.set('imageListItemSize', itemSize)
          }}
        />
        <LunaToolbarSeparator />
        <ToolbarIcon
          icon="stop"
          title={t('stop')}
          onClick={() => store.stop()}
          disabled={isEmpty(store.tasks)}
        />
        <ToolbarIcon
          icon="pause"
          title={t('interrupt')}
          onClick={() => store.interrupt()}
          disabled={isEmpty(store.tasks)}
        />
        <LunaToolbarSpace />
        <ToolbarIcon
          icon="delete-all"
          title={t('deleteAllImages')}
          onClick={async () => {
            const result = await LunaModal.confirm(t('deleteAllImagesConfirm'))
            if (result) {
              store.deleteAllImages()
            }
          }}
          disabled={isEmpty(store.images)}
        />
        <LunaToolbarSeparator />
        <ToolbarIcon
          icon={store.ui.imageListMaximized ? 'shrink' : 'fullscreen'}
          title={t(store.ui.imageListMaximized ? 'restore' : 'maximize')}
          onClick={() => {
            store.ui.set('imageListMaximized', !store.ui.imageListMaximized)
          }}
        />
      </LunaToolbar>
      <div
        className={className(Style.body, {
          [Style.highlight]: dropHighlight,
        })}
        onDrop={onDrop}
        onDragLeave={() => setDropHighlight(false)}
        onDragOver={(e) => {
          e.preventDefault()
          setDropHighlight(true)
        }}
      >
        {isEmpty(images) ? (
          <div className={Style.noImages}>{t('noImages')}</div>
        ) : (
          images
        )}
      </div>
    </div>
  )
})

function Image(image: IImage) {
  return (
    <div
      className={className(Style.item, Style.image, {
        [Style.selected]: image.id === store.selectedImage?.id,
      })}
      key={image.id}
      style={getItemStyle()}
      onClick={() => store.selectImage(image)}
    >
      <img src={toDataUrl(image.data, 'image/png')} draggable={false} />
    </div>
  )
}

function getItemStyle() {
  const { imageListItemSize: itemSize } = store.ui
  let padding = 6
  let margin = 8
  let borderRadius = 4

  if (itemSize < 100) {
    padding = 3
    margin = 4
    borderRadius = 2
  } else if (itemSize > 200) {
    padding = 12
    margin = 16
  }

  return {
    width: itemSize,
    height: itemSize,
    marginRight: margin,
    marginBottom: margin,
    borderRadius,
    padding,
  }
}
