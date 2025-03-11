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
import { notify, isFileDrop } from 'share/renderer/lib/util'
import { t } from '../../../../common/util'
import ToolbarIcon from 'share/renderer/components/ToolbarIcon'
import { useCallback, useRef, useState } from 'react'
import LunaModal from 'luna-modal'
import last from 'licia/last'
import contextMenu from 'share/renderer/lib/contextMenu'
import { getImageName, copyData } from '../../lib/util'
import map from 'licia/map'
import range from 'licia/range'
import dataUrl from 'licia/dataUrl'

export default observer(function () {
  const { project } = store
  const imageListRef = useRef<HTMLDivElement>(null)
  const [resizerStyle, setResizerStyle] = useState<any>({
    height: '10px',
  })
  const [dropHighlight, setDropHighlight] = useState(false)

  const itemStyle = getItemStyle()
  const images: JSX.Element[] = []

  each(project.images, (image) => {
    images.push(<Image key={image.id} image={image} />)
  })

  each(store.tasks, (task) => {
    each(task.images, (image) => {
      let content: JSX.Element | null = null
      if (image.data) {
        content = (
          <>
            <div className={Style.mask}></div>
            <div className={Style.progress}>{task.progress}%</div>
            <img
              src={dataUrl.stringify(image.data, 'image/png')}
              draggable={false}
            />
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

  const saveAll = async function () {
    const { filePaths } = await main.showOpenDialog({
      properties: ['openDirectory'],
    })
    if (!isEmpty(filePaths)) {
      const dir = filePaths[0]
      for (let i = 0, len = project.images.length; i < len; i++) {
        const image = project.images[i]
        await node.writeFile(
          dir + `/${getImageName(image)}`,
          image.data,
          'base64'
        )
      }
      notify(t('saveSuccess'), { icon: 'success' })
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDropHighlight(false)
    project.addFiles(e.dataTransfer.files)
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
          icon="save"
          title={t('saveAll')}
          onClick={saveAll}
          disabled={isEmpty(images)}
        />
        <ToolbarIcon
          icon="open-file"
          title={t('openImage')}
          onClick={() => {
            openFile({
              accept: 'image/png,image/jpeg',
              multiple: true,
            }).then(async (fileList) => store.project.addFiles(fileList as any))
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
          icon="left"
          title={t('moveLeft')}
          onClick={() => store.project.moveImageLeft()}
          disabled={
            isEmpty(images) ||
            store.project.selectedImage === store.project.images[0]
          }
        />
        <ToolbarIcon
          icon="right"
          title={t('moveRight')}
          onClick={() => store.project.moveImageRight()}
          disabled={
            isEmpty(images) ||
            store.project.selectedImage === last(store.project.images)
          }
        />
        <LunaToolbarSeparator />
        <ToolbarIcon
          icon="stop"
          title={t('stopTasks')}
          onClick={() => {
            notify(t('stoppingTasks'))
            store.stop()
          }}
          disabled={isEmpty(store.tasks)}
        />
        <ToolbarIcon
          icon="pause"
          title={t('interruptTask')}
          onClick={() => {
            notify(t('interruptingTask'))
            store.interrupt()
          }}
          disabled={isEmpty(store.tasks)}
        />
        <LunaToolbarSpace />
        <ToolbarIcon
          icon="delete-all"
          title={t('deleteAllImages')}
          onClick={async () => {
            const result = await LunaModal.confirm(t('deleteAllImagesConfirm'))
            if (result) {
              store.project.deleteAllImages()
            }
          }}
          disabled={isEmpty(store.project.images)}
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
          if (!isFileDrop(e)) {
            return
          }
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

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')!

function Image(props: { image: IImage }) {
  const { image } = props
  const src = dataUrl.stringify(image.data, 'image/png')
  const itemStyle = getItemStyle()
  const imgRef = useRef<HTMLImageElement>(null)

  const dragImg = new window.Image()

  const setControlNetImage = (idx: number) => {
    const { project } = store
    project.controlNetUnits[idx].setImage(image)
    project.selectControlNetUnit(idx)
  }

  const onContextMenu = (e: React.MouseEvent) => {
    contextMenu(e, [
      {
        label: t('imgToImg'),
        click() {
          store.project.setInitImage(image)
        },
      },
      ...map(range(3), (val) => {
        return {
          label: `${t('controlNetUnit')} ${val + 1}`,
          click() {
            setControlNetImage(val)
          },
        }
      }),
      {
        label: t('copy'),
        click: () => copyData(image.data, image.info.mime),
      },
      {
        type: 'separator',
      },
      {
        label: t('delete'),
        click: () => store.project.deleteImage(image),
      },
    ])
  }

  return (
    <div
      className={className(Style.item, Style.image, {
        [Style.selected]: image.id === store.project.selectedImage?.id,
      })}
      key={image.id}
      style={itemStyle}
      draggable={true}
      onContextMenu={onContextMenu}
      onMouseDown={() => {
        if (dragImg.src || !imgRef.current) {
          return
        }
        const img = imgRef.current
        if (img.naturalWidth > img.naturalHeight) {
          canvas.width = itemStyle.width - itemStyle.padding * 2
          canvas.height = img.naturalHeight * (canvas.width / img.naturalWidth)
        } else {
          canvas.height = itemStyle.width - itemStyle.padding * 2
          canvas.width = img.naturalWidth * (canvas.height / img.naturalHeight)
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        dragImg.src = canvas.toDataURL()
      }}
      onDragStart={(e) => {
        e.dataTransfer.setData('imageId', image.id)
        e.dataTransfer.setData('imageData', image.data)
        e.dataTransfer.setData('imageMime', image.info.mime)
        if (dragImg.src) {
          e.dataTransfer.setDragImage(
            dragImg,
            Math.round(canvas.width / 2),
            Math.round(canvas.height / 2)
          )
        }
      }}
      onClick={() => store.project.selectImage(image)}
      onDoubleClick={() => main.openImage(image.data, getImageName(image))}
    >
      <img ref={imgRef} src={src} draggable={false} />
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
