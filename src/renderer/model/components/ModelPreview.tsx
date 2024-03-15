import store from '../store'
import Style from './ModelPreview.module.scss'
import { t } from '../../lib/util'
import { observer } from 'mobx-react-lite'
import LunaImageViewer from 'luna-image-viewer/react'
import fileUrl from 'licia/fileUrl'

export default observer(function ModelPreview() {
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

  return (
    <div
      className={Style.modelPreview}
      style={{
        height: store.previewHeight,
      }}
    >
      {body}
    </div>
  )
})
