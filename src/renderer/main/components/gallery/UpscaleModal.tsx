import { observer } from 'mobx-react-lite'
import LunaModal from 'luna-modal/react'
import { createPortal } from 'react-dom'
import { t } from '../../../lib/util'
import { Row, Number, Select } from '../../../components/setting'
import { useState } from 'react'
import Style from './UpscaleModal.module.scss'
import className from 'licia/className'
import isEmpty from 'licia/isEmpty'
import each from 'licia/each'
import store from '../../store'

interface IProps {
  visible: boolean
  onClose?: () => void
}

export default observer(function UpscaleModal(props: IProps) {
  const [width, setWidth] = useState(512)
  const [height, setHeight] = useState(512)
  const [upscaler1, setUpscaler1] = useState('None')
  const [upscaler2, setUpscaler2] = useState('None')
  const [upscaler2Visibility, setUpscaler2Visibility] = useState(0.7)

  let upscalers: any = {}
  if (!isEmpty(store.upscalers)) {
    each(store.upscalers, (upscaler) => {
      upscalers[upscaler] = upscaler
    })
  } else {
    upscalers = {
      [t('loading')]: 'loading',
    }
  }

  const onClick = () => {
    store.createUpscaleImgTask({
      image: store.selectedImage!.data,
      width,
      height,
      upscaler1,
      upscaler2,
      upscaler2Visibility,
    })
    if (props.onClose) {
      props.onClose()
    }
  }

  return createPortal(
    <LunaModal
      title={t('upscale')}
      visible={props.visible}
      width={500}
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
      <Row className={Style.row}>
        <Select
          value={upscaler1}
          title={t('upscaler') + ' 1'}
          options={upscalers}
          onChange={(val) => setUpscaler1(val)}
        />
      </Row>
      <Row className={Style.row}>
        <Select
          value={upscaler2}
          title={t('upscaler') + ' 2'}
          options={upscalers}
          onChange={(val) => setUpscaler2(val)}
        />
        <Number
          value={upscaler2Visibility}
          title={t('upscaler2Visibility')}
          min={0}
          max={1}
          step={0.01}
          range={true}
          onChange={(val) => setUpscaler2Visibility(val)}
        />
      </Row>
      <div
        className={className(Style.generate, 'button', 'primary')}
        onClick={onClick}
      >
        {t('generate')}
      </div>
    </LunaModal>,
    document.body
  )
})
