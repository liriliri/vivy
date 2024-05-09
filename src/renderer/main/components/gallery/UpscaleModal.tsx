import { observer } from 'mobx-react-lite'
import LunaModal from 'luna-modal/react'
import { createPortal } from 'react-dom'
import { notify, t } from '../../../lib/util'
import { downloadModels, getModelUrl } from '../../lib/model'
import { Row, Number, Select } from '../../../components/setting'
import { useEffect, useState } from 'react'
import className from 'licia/className'
import isEmpty from 'licia/isEmpty'
import each from 'licia/each'
import store from '../../store'
import { ModelType } from '../../../../common/types'
import contain from 'licia/contain'
import { IImage } from '../../store/types'

interface IProps {
  visible: boolean
  image: IImage
  onClose?: () => void
}

export default observer(function UpscaleModal(props: IProps) {
  const [width, setWidth] = useState(512)
  const [height, setHeight] = useState(512)
  const [upscaler1, setUpscaler1] = useState('None')
  const [upscaler2, setUpscaler2] = useState('None')
  const [upscaler2Visibility, setUpscaler2Visibility] = useState(0.7)
  const ratio = props.image.info.width / props.image.info.height

  useEffect(() => {
    if (props.visible) {
      setWidth(props.image.info.width * 2)
      setHeight(props.image.info.height * 2)
    }
  }, [props.visible])

  let upscalers: any = {}
  let upscalerDisabled = false
  if (!isEmpty(store.upscalers)) {
    each(store.upscalers, (upscaler) => {
      if (
        contain(upscalersWithoutModel, upscaler) ||
        upscalerParams[upscaler]
      ) {
        let name = upscaler
        if (name === 'SwinIR_4x') {
          name = 'SwinIR 4x'
        } else if (name === 'ScuNET') {
          name = 'ScuNET GAN'
        }
        upscalers[name] = upscaler
      }
    })
  } else {
    upscalerDisabled = true
    upscalers = {
      [t('empty')]: 'empty',
    }
  }

  const onClick = async () => {
    if (
      !(await checkUpscalerModel(upscaler1)) ||
      !(await checkUpscalerModel(upscaler2))
    ) {
      notify(t('modelMissingErr'))
      return
    }

    store.createUpscaleImgTask({
      image: props.image.data,
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
      <Row className="modal-setting-row">
        <Number
          value={width}
          title={t('width')}
          min={64}
          max={2048}
          onChange={(val) => {
            setWidth(val)
            setHeight(Math.round(val / ratio))
          }}
        />
        <Number
          value={height}
          title={t('height')}
          min={64}
          max={2048}
          onChange={(val) => {
            setHeight(val)
            setWidth(Math.round(val * ratio))
          }}
        />
      </Row>
      <Row className="modal-setting-row">
        <Select
          value={upscaler1}
          title={t('upscaler') + ' 1'}
          options={upscalers}
          disabled={upscalerDisabled}
          onChange={(val) => setUpscaler1(val)}
        />
      </Row>
      <Row className="modal-setting-row">
        <Select
          value={upscaler2}
          title={t('upscaler') + ' 2'}
          options={upscalers}
          disabled={upscalerDisabled}
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
        className={className('modal-button', 'button', 'primary')}
        onClick={onClick}
      >
        {t('generate')}
      </div>
    </LunaModal>,
    document.body
  )
})

const upscalerParams: any = {
  ESRGAN_4x: {
    fileName: 'ESRGAN_4x.pth',
    type: ModelType.ESRGAN,
  },
  LDSR: {
    url: 'https://heibox.uni-heidelberg.de/f/578df07c8fc04ffbadf3/?dl=1',
    fileName: 'model.ckpt',
    type: ModelType.LDSR,
  },
  'R-ESRGAN 4x+': {
    fileName: 'RealESRGAN_x4plus.pth',
    type: ModelType.RealESRGAN,
  },
  'R-ESRGAN 4x+ Anime6B': {
    fileName: 'RealESRGAN_x4plus_anime_6B.pth',
    type: ModelType.RealESRGAN,
  },
  'ScuNET GAN': {
    fileName: 'ScuNET.pth',
    type: ModelType.ScuNET,
  },
  'ScuNET PSNR': {
    fileName: 'ScuNET.pth',
    type: ModelType.ScuNET,
  },
  'SwinIR 4x': {
    fileName: 'SwinIR_4x.pth',
    type: ModelType.SwinIR,
  },
  'DAT x2': {
    fileName: 'DAT_x2.pth',
    type: ModelType.DAT,
  },
  'DAT x3': {
    fileName: 'DAT_x3.pth',
    type: ModelType.DAT,
  },
  'DAT x4': {
    fileName: 'DAT_x4.pth',
    type: ModelType.DAT,
  },
}

upscalerParams['SwinIR_4x'] = upscalerParams['SwinIR 4x']
upscalerParams['ScuNET'] = upscalerParams['ScuNET GAN']

const upscalersWithoutModel = ['None', 'Lanczos', 'Nearest']

async function checkUpscalerModel(upscaler: string) {
  if (contain(upscalersWithoutModel, upscaler)) {
    return true
  }

  const param = upscalerParams[upscaler]
  if (!param.url) {
    param.url = getModelUrl(upscaler)
  }

  return await downloadModels([param])
}
