import { observer } from 'mobx-react-lite'
import LunaModal from 'luna-modal/react'
import { createPortal } from 'react-dom'
import { t } from '../../../lib/util'
import { Row, Number } from '../../../components/setting'
import { useState } from 'react'
import Style from './UpscaleModal.module.scss'
import className from 'licia/className'
import store from '../../store'

interface IProps {
  visible: boolean
  onClose?: () => void
}

export default observer(function UpscaleModal(props: IProps) {
  const [width, setWidth] = useState(512)
  const [height, setHeight] = useState(512)

  const onClick = () => {
    store.createUpscaleImgTask({
      image: store.selectedImage!.data,
      width,
      height,
    })
    if (props.onClose) {
      props.onClose()
    }
  }

  return createPortal(
    <LunaModal
      title={t('upscale')}
      visible={props.visible}
      width={350}
      onClose={props.onClose}
    >
      <Row className={Style.row}>
        <Number
          value={width}
          title={t('width')}
          min={64}
          max={2048}
          onChange={(val) => setWidth(val)}
        />
        <Number
          value={height}
          title={t('height')}
          min={64}
          max={2048}
          onChange={(val) => setHeight(val)}
        />
      </Row>
      <button className={className(Style.generate, 'button')} onClick={onClick}>
        {t('generate')}
      </button>
    </LunaModal>,
    document.body
  )
})
