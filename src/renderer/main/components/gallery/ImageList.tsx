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

  return (
    <div className={Style.imageList}>
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
          onClick={() => store.deleteAllImages()}
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
