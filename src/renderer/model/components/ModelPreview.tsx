import store from '../store'
import Style from './ModelPreview.module.scss'
import { notify, isFileDrop } from 'share/renderer/lib/util'
import { t } from '../../../common/util'
import { observer } from 'mobx-react-lite'
import LunaImageViewer from 'luna-image-viewer/react'
import fileUrl from 'licia/fileUrl'
import { JSX, useRef, useState } from 'react'
import className from 'licia/className'
import convertBin from 'licia/convertBin'
import fileType from 'licia/fileType'
import isDataUrl from 'licia/isDataUrl'
import startWith from 'licia/startWith'
import openFile from 'licia/openFile'
import isFile from 'licia/isFile'
import isEmpty from 'licia/isEmpty'
import dataUrl from 'licia/dataUrl'

export default observer(function ModelPreview() {
  const modelPreviewRef = useRef<HTMLDivElement>(null)
  const [dropHighlight, setDropHighlight] = useState(false)

  let body: JSX.Element | null = null

  if (store.selectedModel && store.selectedModel.preview) {
    const { preview } = store.selectedModel
    const src = isDataUrl(preview) ? preview : fileUrl(preview)
    body = <LunaImageViewer image={src} />
  } else {
    body = (
      <div
        className={Style.noPreview}
        onClick={() => {
          if (!store.selectedModel) {
            return
          }

          openFile({
            accept: 'image/png,image/jpeg,image/webp',
          }).then(async (fileList) => {
            if (!isEmpty(fileList)) {
              setModelPreview(fileList[0])
            }
          })
        }}
      >
        {store.selectedModel ? t('noPreview') : t('selectModelToPreview')}
      </div>
    )
  }

  async function setModelPreview(file: string | Blob, mime = '') {
    if (!store.selectedModel) {
      return
    }

    let data = ''
    if (isFile(file)) {
      const buf = await convertBin.blobToArrBuffer(file)
      const type = fileType(buf)
      if (type) {
        mime = type.mime
        data = convertBin(buf, 'base64')
      }
    } else {
      data = file as string
    }

    if (!data) {
      return
    }
    if (!mime || !startWith(mime, 'image/')) {
      notify(t('unsupportedFormat'), { icon: 'warning' })
      return
    }

    store.selectedModel.preview = dataUrl.stringify(data, mime)
    await main.setModelPreview(
      store.selectedType,
      store.selectedModel.name,
      data,
      mime
    )
  }

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDropHighlight(false)
    if (isFileDrop(e)) {
      setModelPreview(e.dataTransfer.files[0])
    } else {
      setModelPreview(
        e.dataTransfer.getData('imageData'),
        e.dataTransfer.getData('imageMime')
      )
    }
  }

  const onDragLeave = () => setDropHighlight(false)

  const onDragOver = (e) => {
    e.preventDefault()
    setDropHighlight(true)
  }

  return (
    <div
      className={className(Style.modelPreview, {
        [Style.highlight]: dropHighlight,
      })}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      ref={modelPreviewRef}
    >
      {body}
    </div>
  )
})
