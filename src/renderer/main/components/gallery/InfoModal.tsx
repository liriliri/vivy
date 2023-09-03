import LunaModal from 'luna-modal/react'
import { observer } from 'mobx-react-lite'
import { createPortal } from 'react-dom'
import { t } from '../../../lib/util'
import store from '../../store'

interface IProps {
  visible: boolean
  onClose?: () => void
}

export default observer(function InfoModal(props: IProps) {
  let content: JSX.Element | null = null

  if (store.selectedImage?.info) {
    const info = store.selectedImage.info
    content = (
      <>
        <div>{info.prompt}</div>
        <div>{info.negativePrompt}</div>
      </>
    )
  }

  return createPortal(
    <LunaModal
      title={t('imageInfo')}
      visible={props.visible}
      width={640}
      onClose={props.onClose}
    >
      {content}
    </LunaModal>,
    document.body
  )
})
