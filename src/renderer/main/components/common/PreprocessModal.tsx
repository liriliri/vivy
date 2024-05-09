import { observer } from 'mobx-react-lite'
import LunaModal from 'luna-modal/react'
import { createPortal } from 'react-dom'
import { notify, t, toDataUrl } from '../../../lib/util'
import { Number, Row, Select } from '../../../components/setting'
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
import clamp from 'licia/clamp'

interface IProps {
  visible: boolean
  image: IImage
  onClose?: () => void
}

export default observer(function PreprocessModal(props: IProps) {
  const [controlType, setControlType] = useState('All')
  const [preprocessor, setPreprocessor] = useState('none')
  const [isProcessing, setIsProcessing] = useState(false)
  const [resolution, setResolution] = useState(512)
  const [processedImage, setProcessedImage] = useState<string>('')

  useEffect(() => {
    if (props.visible) {
      setProcessedImage('')
      const width = props.image.info.width
      setResolution(clamp(width, 64, 512))
    }
  }, [props.visible])

  let controlTypes: any = {}
  let controlTypeDisabled = false
  const preprocessors: any = {
    [t('empty')]: 'empty',
  }
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
        controlnet_processor_res: resolution,
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
          onChange={(val) => {
            setControlType(val)
            const controlType = store.controlTypes[val]
            setPreprocessor(controlType.default_option)
          }}
        />
        <Select
          value={preprocessor}
          title={t('preprocessor')}
          options={preprocessors}
          disabled={controlTypeDisabled}
          onChange={(val) => setPreprocessor(val)}
        />
        <Number
          value={resolution}
          title={t('width')}
          min={64}
          max={2048}
          step={8}
          range={true}
          onChange={(val) => setResolution(val)}
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
