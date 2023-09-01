import { observer } from 'mobx-react-lite'
import each from 'licia/each'
import className from 'licia/className'
import isEmpty from 'licia/isEmpty'
import LunaToolbar, {
  LunaToolbarSeparator,
  LunaToolbarSpace,
} from 'luna-toolbar/react'
import store, { IImage, TaskStatus } from '../../store'
import Style from './ImageList.module.scss'
import { t } from '../../../lib/util'
import ToolbarIcon from '../common/ToolbarIcon'
import { useCallback, useRef, useState } from 'react'
import LunaModal from 'luna-modal'
import ProgressBar from './ProgressBar'

export default observer(function () {
  const imageListRef = useRef<HTMLDivElement>(null)
  const [resizerStyle, setResizerStyle] = useState<any>({
    height: '10px',
  })

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
            <div className={Style.progress}>{task.progress}%</div>
            <img src={`data:image/png;base64,${image.data}`} />
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
      store.setUi('imageListHeight', height + deltaY)
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
          onClick={() => store.openImage()}
        />
        <LunaToolbarSeparator />
        <ToolbarIcon
          icon="zoom-in"
          title={t('zoomIn')}
          disabled={store.ui.imageListItemSize > 200 || isEmpty(images)}
          onClick={() => {
            const itemSize = Math.round(store.ui.imageListItemSize * 1.1)
            store.setUi('imageListItemSize', itemSize)
          }}
        />
        <ToolbarIcon
          icon="zoom-out"
          title={t('zoomOut')}
          disabled={store.ui.imageListItemSize < 50 || isEmpty(images)}
          onClick={() => {
            const itemSize = Math.round(store.ui.imageListItemSize * 0.9)
            store.setUi('imageListItemSize', itemSize)
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
          icon="fullscreen"
          title={t('maximize')}
          onClick={() => {
            store.setUi('imageListMaximized', !store.ui.imageListMaximized)
          }}
        />
        <LunaToolbarSeparator />
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
      </LunaToolbar>
      <div className={Style.body}>
        {isEmpty(images) ? (
          <div className={Style.noImages}>{t('noImages')}</div>
        ) : (
          images
        )}
      </div>
      <ProgressBar />
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
      <img src={`data:image/png;base64,${image.data}`} />
    </div>
  )
}

function getItemStyle() {
  const { imageListItemSize: itemSize } = store.ui
  let padding = 4
  let margin = 8
  let borderRadius = 4

  if (itemSize < 100) {
    padding = 2
    margin = 4
    borderRadius = 2
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
