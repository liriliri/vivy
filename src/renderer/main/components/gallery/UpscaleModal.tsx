import { observer } from 'mobx-react-lite'
import LunaModal from 'luna-modal/react'
import { createPortal } from 'react-dom'
import { notify, t } from '../../../lib/util'
import { Row, Number, Select } from '../../../components/setting'
import { useEffect, useState } from 'react'
import className from 'licia/className'
import isEmpty from 'licia/isEmpty'
import each from 'licia/each'
import store from '../../store'
import { ModelType } from '../../../../common/types'
import contain from 'licia/contain'

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

  useEffect(() => {
    const { project } = store
    if (props.visible) {
      setWidth(project.genOptions.width * 2)
      setHeight(project.genOptions.height * 2)
    }
  }, [props.visible])

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

  const onClick = async () => {
    if (
      !(await checkUpscalerModel(upscaler1)) ||
      !(await checkUpscalerModel(upscaler2))
    ) {
      notify(t('modelMissingErr'))
      return
    }
    store.createUpscaleImgTask({
      image: store.project.selectedImage!.data,
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
      <Row className="modal-setting-row">
        <Select
          value={upscaler1}
          title={t('upscaler') + ' 1'}
          options={upscalers}
          onChange={(val) => setUpscaler1(val)}
        />
      </Row>
      <Row className="modal-setting-row">
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
        className={className('modal-button', 'button', 'primary')}
        onClick={onClick}
      >
        {t('generate')}
      </div>
    </LunaModal>,
    document.body
  )
})

const upscalerParams = {
  ESRGAN_4x: {
    url: 'https://github.com/cszn/KAIR/releases/download/v1.0/ESRGAN.pth',
    fileName: 'ESRGAN_4x.pth',
    type: ModelType.ESRGAN,
  },
  LDSR: {
    url: 'https://heibox.uni-heidelberg.de/f/578df07c8fc04ffbadf3/?dl=1',
    fileName: 'model.ckpt',
    type: ModelType.LDSR,
  },
  'R-ESRGAN 4x+': {
    url: 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth',
    fileName: 'RealESRGAN_x4plus.pth',
    type: ModelType.RealESRGAN,
  },
  'R-ESRGAN 4x+ Anime6B': {
    url: 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth',
    fileName: 'RealESRGAN_x4plus_anime_6B.pth',
    type: ModelType.RealESRGAN,
  },
  ScuNET: {
    url: 'https://github.com/cszn/KAIR/releases/download/v1.0/scunet_color_real_gan.pth',
    fileName: 'ScuNET.pth',
    type: ModelType.ScuNET,
  },
  'ScuNET PSNR': {
    url: 'https://github.com/cszn/KAIR/releases/download/v1.0/scunet_color_real_psnr.pth',
    fileName: 'ScuNET.pth',
    type: ModelType.ScuNET,
  },
  SwinIR_4x: {
    url: 'https://github.com/JingyunLiang/SwinIR/releases/download/v0.0/003_realSR_BSRGAN_DFOWMFC_s64w8_SwinIR-L_x4_GAN.pth',
    fileName: 'SwinIR_4x.pth',
    type: ModelType.SwinIR,
  },
}

const upscalersWithoutModel = ['None', 'Lanczos', 'Nearest']

async function checkUpscalerModel(upscaler: string) {
  if (contain(upscalersWithoutModel, upscaler)) {
    return true
  }

  const param = upscalerParams[upscaler]

  if (!(await main.isModelExists(param.type, param.fileName))) {
    main.downloadModel(param)
    main.showDownload()
    return false
  }

  return true
}
