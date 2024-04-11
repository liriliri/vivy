import LunaModal from 'luna-modal/react'
import { createPortal } from 'react-dom'
import { t } from '../../lib/util'
import store from '../store'

interface IProps {
  visible: boolean
  onClose: () => void
}

export default function MetadataModal(props: IProps) {
  return createPortal(
    <LunaModal
      title={t('metadata')}
      onClose={props.onClose}
      visible={props.visible}
      width={500}
    >
      {JSON.stringify(store.metadata).slice(0, 100)}
    </LunaModal>,
    document.body
  )
}
