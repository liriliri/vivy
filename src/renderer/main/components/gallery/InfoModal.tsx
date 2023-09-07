import LunaModal from 'luna-modal/react'
import { observer } from 'mobx-react-lite'
import { createPortal } from 'react-dom'
import { t } from '../../../lib/util'
import store from '../../store'
import Style from './InfoModal.module.scss'
import copy from 'licia/copy'
import CopyButton from '../../../components/CopyButton'

interface IProps {
  visible: boolean
  onClose?: () => void
}

export default observer(function InfoModal(props: IProps) {
  let content: JSX.Element | null = null

  if (store.selectedImage?.info) {
    const info = store.selectedImage.info
    const prompt = info.prompt ? (
      <div className={Style.group}>
        <div className={Style.title}>{t('prompt')}</div>
        <CopyButton className={Style.copy} onClick={() => copy(info.prompt!)} />
        <div className={Style.content}>{info.prompt}</div>
      </div>
    ) : null
    const negativePrompt = info.negativePrompt ? (
      <div className={Style.group}>
        <div className={Style.title}>{t('negativePrompt')}</div>
        <CopyButton
          className={Style.copy}
          onClick={() => copy(info.negativePrompt!)}
        />
        <div className={Style.content}>{info.negativePrompt}</div>
      </div>
    ) : null

    content = (
      <>
        {prompt}
        {negativePrompt}
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
