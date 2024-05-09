import { observer } from 'mobx-react-lite'
import LunaModal from 'luna-modal/react'
import { createPortal } from 'react-dom'
import { notify, t, toDataUrl } from '../../../lib/util'
import { Row, Select } from '../../../components/setting'
import { useEffect, useState } from 'react'
import className from 'licia/className'
import { IImage } from '../../store/types'
import store from '../../store'
import isEmpty from 'licia/isEmpty'
import each from 'licia/each'
import Style from './PreprocessModal.module.scss'
import LunaToolbar from 'luna-toolbar/react'
import ToolbarIcon from '../../../components/ToolbarIcon'
import LunaImageViewer from 'luna-image-viewer/react'
import { LoadingCircle } from '../../../components/loading'
import * as webui from '../../../lib/webui'

interface IProps {
  visible: boolean
  image: IImage
  onClose?: () => void
}

export default observer(function PreprocessModal(props: IProps) {
  const [controlType, setControlType] = useState('All')
  const [preprocessor, setPreprocessor] = useState('none')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedImage, setProcessedImage] = useState<string>('')

  useEffect(() => {
    if (props.visible) {
      setProcessedImage('')
    }
  }, [props.visible])

  let controlTypes: any = {}
  let controlTypeDisabled = false
  const preprocessors: any = {}
  if (!isEmpty(store.controlTypes)) {
    each(store.controlTypes, (controlType, name) => {
      const value = name
      if (value === 'All') {
        name = t('all')
      }
      controlTypes[name] = value
    })
    const moduleList = store.controlTypes[controlType].module_list
    each(moduleList, (name) => {
      const value = name
      if (value === 'none') {
        name = t('none')
      }
      preprocessors[name] = value
    })
  } else {
    controlTypeDisabled = true
    controlTypes = {
      [t('empty')]: 'empty',
    }
  }

  const onClick = async () => {
    if (isProcessing || !store.isWebUIReady || preprocessor === 'none') {
      return
    }
    setIsProcessing(true)
    try {
      const image = await webui.preprocess({
        controlnet_module: preprocessor,
        controlnet_input_images: [props.image.data],
      })
      setProcessedImage(image)
    } catch (e) {
      notify(t('generateErr'))
    }
    setIsProcessing(false)
  }

  let image = ''
  if (processedImage) {
    image = toDataUrl(processedImage, 'image/png')
  } else {
    image = toDataUrl(props.image.data, props.image.info.mime)
  }

  return createPortal(
    <LunaModal
      title={t('preprocess')}
      visible={props.visible}
      width={640}
      onClose={props.onClose}
    >
      <div className={Style.image}>
        <LunaToolbar className={Style.toolbar}>
          <ToolbarIcon icon="save" title={t('save')} onClick={() => {}} />
        </LunaToolbar>
        <LunaImageViewer className={Style.imageBody} image={image} />
      </div>
      <Row className="modal-setting-row">
        <Select
          value={controlType}
          title={t('controlType')}
          options={controlTypes}
          disabled={controlTypeDisabled}
          onChange={(val) => setControlType(val)}
        />
        <Select
          value={preprocessor}
          title={t('preprocessor')}
          options={preprocessors}
          disabled={controlTypeDisabled}
          onChange={(val) => setPreprocessor(val)}
        />
      </Row>
      <div
        className={className('modal-button', 'button', 'primary')}
        onClick={onClick}
      >
        {isProcessing ? (
          <LoadingCircle className={Style.loading} />
        ) : (
          t('generate')
        )}
      </div>
    </LunaModal>,
    document.body
  )
})
