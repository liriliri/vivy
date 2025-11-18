import { observer } from 'mobx-react-lite'
import LunaModal from 'luna-modal/react'
import { createPortal } from 'react-dom'
import { t } from 'common/util'
import {
  IModelParam,
  checkCodeFormerModel,
  checkFaceXLibModel,
  checkGfpganModel,
  downloadModels,
} from '../../lib/model'
import { Row, Number } from 'share/renderer/components/setting'
import { useState } from 'react'
import className from 'licia/className'
import { IImage } from '../../store/types'
import store from '../../store'

interface IProps {
  visible: boolean
  image: IImage
  onClose?: () => void
}

export default observer(function FaceRestorationModal(props: IProps) {
  const [gfpganVisibility, setGfpganVisibility] = useState(0)
  const [codeFormerVisibility, setCodeFormerVisibility] = useState(1)
  const [codeFormerWeight, setCodeFormerWeight] = useState(0)

  const onClick = async () => {
    const models: Array<IModelParam[]> = []
    const gfpgan = gfpganVisibility > 0
    if (gfpgan) {
      models.push(checkGfpganModel())
    }
    const codeFormer = codeFormerVisibility > 0
    if (codeFormer) {
      models.push(checkCodeFormerModel())
    }
    if (gfpgan || codeFormer) {
      models.push(checkFaceXLibModel())
    }
    if (!(await downloadModels(...models))) {
      return
    }

    store.createFaceRestorationTask({
      image: props.image.data,
      width: props.image.info.width,
      height: props.image.info.height,
      codeFormerVisibility,
      gfpganVisibility,
      codeFormerWeight,
    })

    if (props.onClose) {
      props.onClose()
    }
  }

  return createPortal(
    <LunaModal
      title={t('faceRestoration')}
      visible={props.visible}
      width={500}
      onClose={props.onClose}
    >
      <Row className="modal-setting-row">
        <Number
          value={gfpganVisibility}
          title={t('gfpganVisibility')}
          min={0}
          max={1}
          step={0.01}
          range={true}
          onChange={(val) => setGfpganVisibility(val)}
        />
      </Row>
      <Row className="modal-setting-row">
        <Number
          value={codeFormerVisibility}
          title={t('codeFormerVisibility')}
          min={0}
          max={1}
          step={0.01}
          range={true}
          onChange={(val) => setCodeFormerVisibility(val)}
        />
        <Number
          value={codeFormerWeight}
          title={t('codeFormerWeight')}
          min={0}
          max={1}
          step={0.01}
          range={true}
          onChange={(val) => setCodeFormerWeight(val)}
        />
      </Row>
      <div
        className={className('modal-button', 'button', 'primary')}
        onClick={onClick}
      >
        {t('generate')}
      </div>
    </LunaModal>,
    document.body
  )
})
