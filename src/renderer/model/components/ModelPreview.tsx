import store from '../store'
import Style from './ModelPreview.module.scss'
import { isFileDrop, notify, t, toDataUrl } from '../../lib/util'
import { observer } from 'mobx-react-lite'
import LunaImageViewer from 'luna-image-viewer/react'
import fileUrl from 'licia/fileUrl'
import { useCallback, useRef, useState } from 'react'
import className from 'licia/className'
import convertBin from 'licia/convertBin'
import fileType from 'licia/fileType'
import isDataUrl from 'licia/isDataUrl'

export default observer(function ModelPreview() {
  const modelPreviewRef = useRef<HTMLDivElement>(null)
  const [dropHighlight, setDropHighlight] = useState(false)
  const [resizerStyle, setResizerStyle] = useState<any>({
    height: '10px',
  })

  let body: JSX.Element | null = null

  if (store.selectedModel && store.selectedModel.preview) {
    const { preview } = store.selectedModel
    const src = isDataUrl(preview) ? preview : fileUrl(preview)
    body = <LunaImageViewer image={src} />
  } else {
    body = (
      <div className={Style.noPreview}>
        {store.selectedModel ? t('noPreview') : t('selectModelToPreview')}
      </div>
    )
  }

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    if (!store.selectedModel) {
      return
    }
    setDropHighlight(false)
    let data = ''
    let mime = ''
    if (isFileDrop(e)) {
      const buf = await convertBin.blobToArrBuffer(e.dataTransfer.files[0])
      const type = fileType(buf)
      if (type) {
        mime = type.mime
        data = convertBin(buf, 'base64')
      }
    } else {
      const imageData = e.dataTransfer.getData('imageData')
      if (imageData) {
        data = imageData
        mime = e.dataTransfer.getData('imageMime')
      }
    }
    if (!data) {
      return
    }
    if (!mime) {
      notify(t('unsupportedFormat'))
      return
    }

    store.selectedModel.preview = toDataUrl(data, mime)
    await main.setModelPreview(
      store.selectedType,
      store.selectedModel.name,
      data,
      mime
    )
  }

  const onDragLeave = () => setDropHighlight(false)

  const onDragOver = (e) => {
    e.preventDefault()
    setDropHighlight(true)
  }

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const startY = e.clientY
    const height = modelPreviewRef.current!.offsetHeight
    setResizerStyle({
      position: 'fixed',
      width: '100%',
      height: '100%',
    })

    const onMouseMove = (e: MouseEvent) => {
      const deltaY = startY - e.clientY
      modelPreviewRef.current!.style.height = `${height + deltaY}px`
    }

    const onMouseUp = (e: MouseEvent) => {
      setResizerStyle({
        height: '10px',
      })
      const deltaY = startY - e.clientY
      store.setPreviewHeight(height + deltaY)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [])

  return (
    <div
      className={className(Style.modelPreview, {
        [Style.highlight]: dropHighlight,
      })}
      style={{
        height: store.previewHeight,
      }}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      ref={modelPreviewRef}
    >
      <div
        className={Style.resizer}
        style={resizerStyle}
        onMouseDown={onMouseDown}
      ></div>
      {body}
    </div>
  )
})
