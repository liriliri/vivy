import store from '../store'
import Style from './ModelPreview.module.scss'
import { t } from '../../lib/util'
import { observer } from 'mobx-react-lite'
import LunaImageViewer from 'luna-image-viewer/react'
import fileUrl from 'licia/fileUrl'
import { useCallback, useRef, useState } from 'react'

export default observer(function ModelPreview() {
  const modelPreviewRef = useRef<HTMLDivElement>(null)
  const [resizerStyle, setResizerStyle] = useState<any>({
    height: '10px',
  })

  let body: JSX.Element | null = null

  if (store.selectedModel && store.selectedModel.preview) {
    body = <LunaImageViewer image={fileUrl(store.selectedModel.preview)} />
  } else {
    body = (
      <div className={Style.noPreview}>
        {store.selectedModel ? t('noPreview') : t('selectModelToPreview')}
      </div>
    )
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
      className={Style.modelPreview}
      style={{
        height: store.previewHeight,
      }}
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
