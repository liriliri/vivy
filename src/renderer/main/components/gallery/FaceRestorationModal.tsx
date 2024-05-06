import { observer } from 'mobx-react-lite'
import LunaModal from 'luna-modal/react'
import { createPortal } from 'react-dom'
import { notify, t } from '../../../lib/util'
import { getModelUrl } from '../../lib/model'
import { Row, Number } from '../../../components/setting'
import { useState } from 'react'
import className from 'licia/className'
import { ModelType } from '../../../../common/types'
import { IImage } from '../../store/types'
import store from '../../store'

interface IProps {
  visible: boolean
  image: IImage
  onClose?: () => void
}

export default observer(function FaceRestorationModal(props: IProps) {
  const [gfpganVisibility, setGfpganVisibility] = useState(0)
  const [codeFormerVisibility, setCodeFormerVisibility] = useState(0)
  const [codeFormerWeight, setCodeFormerWeight] = useState(0)

  const onClick = async () => {
    const gfpgan = gfpganVisibility > 0
    const codeFormer = codeFormerVisibility > 0
    const faceXLib = gfpgan || codeFormer
    const checkGfpgan = !gfpgan || (await checkGfpganModel())
    const checkCodeFormer = !codeFormer || (await checkCodeFormerModel())
    const checkFaceXLib = !faceXLib || (await checkFaceXLibModel())

    if (!checkGfpgan || !checkCodeFormer || !checkFaceXLib) {
      notify(t('modelMissingErr'))
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

async function checkFaceXLibModel() {
  const param = {
    url: getModelUrl('FaceXLib'),
    fileName: 'parsing_parsenet.pth',
    type: ModelType.GFPGAN,
  }

  return await downloadModel(param)
}

async function checkGfpganModel() {
  const param = {
    url: getModelUrl('GFPGAN'),
    fileName: 'GFPGANv1.4.pth',
    type: ModelType.GFPGAN,
  }

  return await downloadModel(param)
}

async function checkCodeFormerModel() {
  const param = {
    url: getModelUrl('CodeFormer'),
    fileName: 'codeformer-v0.1.0.pth',
    type: ModelType.CodeFormer,
  }

  return await downloadModel(param)
}

async function downloadModel(param: any) {
  if (!(await main.isModelExists(param.type, param.fileName))) {
    main.downloadModel(param)
    main.showDownload()
    return false
  }

  return true
}
