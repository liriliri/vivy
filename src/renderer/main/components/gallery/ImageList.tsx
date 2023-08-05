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
import { i18n } from '../../../lib/util'
import ToolbarIcon from '../common/ToolbarIcon'
import { useCallback, useRef, useState } from 'react'
import LunaModal from 'luna-modal'

function Image(image: IImage) {
  return (
    <div
      className={className(Style.item, {
        [Style.selected]: image.id === store.selectedImage?.id,
      })}
      key={image.id}
      onClick={() => store.selectImage(image)}
    >
      <img src={`data:image/png;base64,${image.data}`} />
    </div>
  )
}

export default observer(function () {
  const images: JSX.Element[] = []
  const imageListRef = useRef<HTMLDivElement>(null)
  const [resizerStyle, setResizerStyle] = useState<any>({
    height: '10px',
  })

  each(store.images, (image) => {
    images.push(Image(image))
  })

  each(store.tasks, (task) => {
    each(task.images, (image) => {
      if (image.data) {
        images.push(Image(image))
      } else {
        if (task.status === TaskStatus.Wait) {
          images.push(
            <div className={Style.item} key={image.id}>
              <span className="icon-image"></span>
            </div>
          )
        } else {
          images.push(
            <div className={Style.item} key={image.id}>
              {task.progress}%
            </div>
          )
        }
      }
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
      className={Style.imageList}
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
          title={i18n.t('openImage')}
          onClick={() => store.openImage()}
        />
        <LunaToolbarSeparator />
        <ToolbarIcon
          icon="stop"
          title={i18n.t('stop')}
          onClick={() => store.stop()}
          disabled={isEmpty(store.tasks)}
        />
        <ToolbarIcon
          icon="pause"
          title={i18n.t('interrupt')}
          onClick={() => store.interrupt()}
          disabled={isEmpty(store.tasks)}
        />
        <LunaToolbarSpace />
        <LunaToolbarSeparator />
        <ToolbarIcon
          icon="delete-all"
          title={i18n.t('deleteAllImages')}
          onClick={async () => {
            const result = await LunaModal.confirm(
              i18n.t('deleteAllImagesConfirm')
            )
            if (result) {
              store.deleteAllImages()
            }
          }}
          disabled={isEmpty(store.images)}
        />
      </LunaToolbar>
      <div className={Style.body}>
        {isEmpty(images) ? (
          <div className={Style.noImages}>{i18n.t('noImages')}</div>
        ) : (
          images
        )}
      </div>
    </div>
  )
})
