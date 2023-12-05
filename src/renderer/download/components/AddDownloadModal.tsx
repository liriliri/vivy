import LunaModal from 'luna-modal/react'
import { observer } from 'mobx-react-lite'
import { createPortal } from 'react-dom'
import { t } from '../../lib/util'
import { Row, Textarea, Input, Select } from '../../components/setting'
import Style from './AddDownloadModal.module.scss'
import { ModelType } from '../../../common/types'
import className from 'licia/className'
import { useState } from 'react'

interface IProps {
  visible: boolean
  onClose?: () => void
}

export default observer(function AddDownloadModal(props: IProps) {
  const [downloadUrl, setDownloadUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [modelType, setModelType] = useState(ModelType.StableDiffusion)

  return createPortal(
    <LunaModal
      title={t('addDownloadTask')}
      visible={props.visible}
      width={500}
      onClose={props.onClose}
    >
      <Row className={Style.row}>
        <Textarea
          placeholder={t('downloadUrl')}
          value={downloadUrl}
          onChange={(url) => setDownloadUrl(url)}
        />
      </Row>
      <Row className={Style.row}>
        <Input
          title={t('fileName')}
          value={fileName}
          onChange={(name) => setFileName(name)}
        />
        <Select
          title={t('saveTo')}
          value={modelType}
          options={{
            'Stable Diffusion': ModelType.StableDiffusion,
            Lora: ModelType.Lora,
            RealESRGAN: ModelType.RealESRGAN,
            ScuNET: ModelType.ScuNET,
            Embedding: ModelType.Embedding,
          }}
          onChange={(type) => setModelType(type as ModelType)}
        ></Select>
      </Row>
      <div
        className={className(Style.download, 'button', 'primary')}
        onClick={() => {}}
      >
        {t('download')}
      </div>
    </LunaModal>,
    document.body
  )
})
