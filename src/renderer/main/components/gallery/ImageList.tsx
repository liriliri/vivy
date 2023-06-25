import { observer } from 'mobx-react-lite'
import each from 'licia/each'
import className from 'licia/className'
import isEmpty from 'licia/isEmpty'
import LunaToolbar from 'luna-toolbar'
import store, { IImage, TaskStatus } from '../../store'
import Style from './ImageList.module.scss'
import { useEffect, useRef } from 'react'
import { toolbarIcon } from '../../../lib/luna'

function Image(image: IImage) {
  return (
    <div
      className={className(Style.item, {
        [Style.selected]: image === store.selectedImage,
      })}
      key={image.id}
      onClick={() => store.selectImage(image)}
    >
      <img src={`data:image/png;base64,${image.data}`} />
    </div>
  )
}

export default observer(function () {
  const toolbarRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    const toolbar = new LunaToolbar(toolbarRef.current as HTMLDivElement)

    toolbar.appendHtml(
      toolbarIcon(
        'pause',
        () => {
          store.interrupt()
        },
        'Interrupt'
      )
    )
    toolbar.appendSpace()
    toolbar.appendSeparator()
    toolbar.appendHtml(
      toolbarIcon(
        'delete-all',
        () => {
          store.deleteAllImages()
        },
        'Delete All'
      )
    )

    return () => toolbar.destroy()
  }, [])

  return (
    <div className={Style.imageList}>
      <div className={Style.toolbar} ref={toolbarRef}></div>
      <div className={Style.body}>
        {isEmpty(images) ? (
          <div className={Style.noImages}>No Images</div>
        ) : (
          images
        )}
      </div>
    </div>
  )
})
