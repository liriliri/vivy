import LunaModal from 'luna-modal/react'
import { observer } from 'mobx-react-lite'
import { createPortal } from 'react-dom'
import { t } from '../../lib/util'
import { Row, Textarea, Input, Select } from '../../components/setting'
import Style from './AddDownloadModal.module.scss'
import { ModelType, modelTypes } from '../../../common/types'
import className from 'licia/className'
import { useState } from 'react'
import Url from 'licia/Url'
import last from 'licia/last'
import isStrBlank from 'licia/isStrBlank'
import isUrl from 'licia/isUrl'
import isEmpty from 'licia/isEmpty'

interface IProps {
  visible: boolean
  onClose: () => void
}

export default observer(function AddDownloadModal(props: IProps) {
  const [downloadUrl, setDownloadUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [modelType, setModelType] = useState(ModelType.StableDiffusion)

  const onUrlChange = (url) => {
    if (isStrBlank(fileName) && isUrl(url)) {
      setFileName(getFileName(url))
    }
    setDownloadUrl(url)
  }

  const download = () => {
    main.downloadModel({
      url: downloadUrl,
      fileName,
      type: modelType,
    })
    setDownloadUrl('')
    setFileName('')
    setModelType(ModelType.StableDiffusion)
    props.onClose()
  }

  if (isEmpty(downloadUrl)) {
    navigator.clipboard.readText().then((text) => {
      if (isUrl(text)) {
        onUrlChange(text)
      }
    })
  }

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
          onChange={onUrlChange}
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
          options={modelTypes}
          onChange={(type) => setModelType(type as ModelType)}
        ></Select>
      </Row>
      <div
        className={className(Style.download, 'button', 'primary')}
        onClick={download}
      >
        {t('download')}
      </div>
    </LunaModal>,
    document.body
  )
})

export function getFileName(url) {
  let ret = last(url.split('/'))

  if (ret === '') {
    url = new Url(url)
    ret = url.hostname
  }

  return ret
}
