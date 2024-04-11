import LunaModal from 'luna-modal/react'
import LunaObjectViewer from 'luna-object-viewer/react'
import { createPortal } from 'react-dom'
import { t } from '../../lib/util'
import store from '../store'
import Style from './MetadataModal.module.scss'
import className from 'licia/className'
import { useState } from 'react'
import copy from 'licia/copy'

interface IProps {
  visible: boolean
  onClose: () => void
}

export default function MetadataModal(props: IProps) {
  const [showSuccess, setShowSuccess] = useState(false)

  const copyMetadata = () => {
    const text = JSON.stringify(store.metadata, null, 2)
    copy(text)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 1000)
  }

  return createPortal(
    <LunaModal
      title={t('metadata')}
      onClose={props.onClose}
      visible={props.visible}
      width={500}
    >
      <LunaObjectViewer
        className={Style.objectViewer}
        object={store.metadata}
        prototype={false}
      />
      <div
        className={className(
          'modal-button',
          'button',
          showSuccess ? 'success' : 'primary'
        )}
        onMouseDown={(e) => e.preventDefault()}
        onClick={copyMetadata}
      >
        {t(showSuccess ? 'copied' : 'copyMetadata')}
      </div>
    </LunaModal>,
    document.body
  )
}
