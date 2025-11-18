import LunaModal from 'luna-modal/react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { t } from 'common/util'
import { createImage } from '../../lib/util'
import { Row, Number } from 'share/renderer/components/setting'
import className from 'licia/className'
import store from '../../store'
import dataUrl from 'licia/dataUrl'

interface IProps {
  visible: boolean
  onClose: () => void
}

export default function NewImageModal(props: IProps) {
  const [width, setWidth] = useState(512)
  const [height, setHeight] = useState(512)

  const onClick = () => {
    const image = createImage(width, height)
    store.project.setInitImage(dataUrl.parse(image)!.data, 'image/png')
    props.onClose()
  }

  return createPortal(
    <LunaModal
      title={t('newImage')}
      visible={props.visible}
      width={400}
      onClose={props.onClose}
    >
      <Row className="modal-setting-row">
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
      <div
        className={className('modal-button', 'button', 'primary')}
        onClick={onClick}
      >
        {t('new')}
      </div>
    </LunaModal>,
    document.body
  )
}
