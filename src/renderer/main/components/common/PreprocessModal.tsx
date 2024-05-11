import { observer } from 'mobx-react-lite'
import LunaModal from 'luna-modal/react'
import { createPortal } from 'react-dom'
import { notify, t, toDataUrl } from '../../../lib/util'
import { Number, Row, Select } from '../../../components/setting'
import { useEffect, useRef, useState } from 'react'
import className from 'licia/className'
import { IImage } from '../../store/types'
import store from '../../store'
import isEmpty from 'licia/isEmpty'
import each from 'licia/each'
import Style from './PreprocessModal.module.scss'
import LunaToolbar, {
  LunaToolbarButton,
  LunaToolbarSeparator,
} from 'luna-toolbar/react'
import ToolbarIcon from '../../../components/ToolbarIcon'
import LunaImageViewer from 'luna-image-viewer/react'
import ImageViewer from 'luna-image-viewer'
import { LoadingCircle } from '../../../components/loading'
import * as webui from '../../../lib/webui'
import clamp from 'licia/clamp'
import toBool from 'licia/toBool'
import convertBin from 'licia/convertBin'
import download from 'licia/download'
import CopyButton from '../../../components/CopyButton'
import { copyData } from '../../lib/util'
import startWith from 'licia/startWith'
import contain from 'licia/contain'
import { checkPreprocessModel } from '../../lib/model'

interface IProps {
  visible: boolean
  image: IImage
  onClose: () => void
}

export default observer(function PreprocessModal(props: IProps) {
  const [controlType, setControlType] = useState('All')
  const [preprocessor, setPreprocessor] = useState('none')
  const [isProcessing, setIsProcessing] = useState(false)
  const [resolution, setResolution] = useState(512)
  const [thresholdA, setThresholdA] = useState(0)
  const [thresholdB, setThresholdB] = useState(0)
  const [processedImage, setProcessedImage] = useState<{
    data: string
    preprocessor: string
  }>({
    data: '',
    preprocessor: 'none',
  })
  const imageViewerRef = useRef<ImageViewer>()

  useEffect(() => {
    if (props.visible) {
      setProcessedImage({
        data: '',
        preprocessor: 'none',
      })
      const width = props.image.info.width
      setResolution(clamp(width, 64, 512))
    }
  }, [props.visible])

  const preprocessorParmas = store.controlModules[preprocessor]?.sliders || []
  if (preprocessorParmas[1]) {
    const param = preprocessorParmas[1]
    if (thresholdA < param.min || thresholdA > param.max) {
      setThresholdA(param.value)
    }
  }
  if (preprocessorParmas[2]) {
    const param = preprocessorParmas[2]
    if (thresholdB < param.min || thresholdB > param.max) {
      setThresholdB(param.value)
    }
  }

  let controlTypes: any = {}
  let controlTypeDisabled = false
  let preprocessors: any = {
    [t('empty')]: 'empty',
  }
  if (!isEmpty(store.controlTypes)) {
    each(store.controlTypes, (controlType, name) => {
      if (
        contain(
          [
            'IP-Adapter',
            'Inpaint',
            'Instant-ID',
            'InstructP2P',
            'Reference',
            'Revision',
            'T2I-Adapter',
          ],
          name
        )
      ) {
        return
      }
      const value = name
      if (value === 'All') {
        name = t('all')
      } else {
        name = t(name) || name
      }
      controlTypes[name] = value
    })

    const moduleList = store.controlTypes[controlType].module_list
    preprocessors = {}
    each(moduleList, (name) => {
      if (
        startWith(name, 'ip-adapter') ||
        startWith(name, 'inpaint') ||
        startWith(name, 'instant_id') ||
        startWith(name, 'reference') ||
        startWith(name, 'revision') ||
        startWith(name, 't2ia')
      ) {
        return
      }
      const value = name
      if (value === 'none') {
        name = t('none')
      } else {
        name = t(name) || name
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

    if (!(await checkPreprocessModel(preprocessor))) {
      notify(t('modelMissingErr'))
      return
    }

    setIsProcessing(true)
    try {
      const options: any = {
        controlnet_module: preprocessor,
        controlnet_input_images: [props.image.data],
      }
      if (preprocessorParmas[0]) {
        options.controlnet_processor_res = resolution
      }
      if (preprocessorParmas[1]) {
        options.controlnet_threshold_a = thresholdA
      }
      if (preprocessorParmas[2]) {
        options.controlnet_threshold_b = thresholdB
      }
      const image = await webui.preprocess(options)
      setProcessedImage({
        data: image,
        preprocessor,
      })
    } catch (e) {
      notify(t('generateErr'))
    }
    setIsProcessing(false)
  }

  const save = () => {
    if (processedImage.data) {
      const blob = convertBin(processedImage.data, 'Blob')
      download(blob, `${processedImage.preprocessor}.png`, 'image/png')
    }
  }

  const onControlTypeChange = (val: string) => {
    setControlType(val)
    const controlType = store.controlTypes[val]
    setPreprocessor(controlType.default_option)
  }

  let image = ''
  if (processedImage.data) {
    image = toDataUrl(processedImage.data, 'image/png')
  } else {
    image = toDataUrl(props.image.data, props.image.info.mime)
  }

  const hasProcessedImage = toBool(processedImage.data)

  return createPortal(
    <LunaModal
      title={t('preprocess')}
      visible={props.visible}
      width={720}
      onClose={() => {
        if (!isProcessing) {
          props.onClose()
        }
      }}
    >
      <div className={Style.image}>
        <LunaToolbar className={Style.toolbar}>
          <ToolbarIcon
            icon="save"
            title={t('save')}
            disabled={!hasProcessedImage}
            onClick={save}
          />
          <LunaToolbarButton disabled={!hasProcessedImage} onClick={() => {}}>
            <CopyButton
              className="toolbar-icon"
              onClick={() => copyData(processedImage.data, 'image/png')}
            />
          </LunaToolbarButton>
          <LunaToolbarSeparator />
          <ToolbarIcon
            icon="reset"
            title={t('reset')}
            onClick={() => imageViewerRef.current?.reset()}
          />
          <ToolbarIcon
            icon="original"
            title={t('originalSize')}
            onClick={() => imageViewerRef.current?.zoomTo(1)}
          />
          <ToolbarIcon
            icon="rotate-left"
            title={t('rotateLeft')}
            onClick={() => imageViewerRef.current?.rotate(-90)}
          />
          <ToolbarIcon
            icon="rotate-right"
            title={t('rotateRight')}
            onClick={() => imageViewerRef.current?.rotate(90)}
          />
        </LunaToolbar>
        <LunaImageViewer
          className={Style.imageBody}
          image={image}
          onCreate={(imageViewer) => (imageViewerRef.current = imageViewer)}
        />
      </div>
      <Row className="modal-setting-row">
        <Select
          value={controlType}
          title={t('controlType')}
          options={controlTypes}
          disabled={controlTypeDisabled}
          onChange={onControlTypeChange}
        />
        <Select
          value={preprocessor}
          title={t('preprocessor')}
          options={preprocessors}
          disabled={controlTypeDisabled}
          onChange={(val) => setPreprocessor(val)}
        />
      </Row>
      <Row className="modal-setting-row">
        {preprocessorParmas[0] && (
          <Number
            value={resolution}
            title={t('width')}
            min={preprocessorParmas[0].min}
            max={preprocessorParmas[0].max}
            step={preprocessorParmas[0].step}
            range={true}
            onChange={(val) => setResolution(val)}
          />
        )}
        {preprocessorParmas[1] && (
          <Number
            value={thresholdA}
            title={t(preprocessorParmas[1].name) || preprocessorParmas[1].name}
            min={preprocessorParmas[1].min}
            max={preprocessorParmas[1].max}
            step={preprocessorParmas[1].step}
            range={true}
            onChange={(val) => setThresholdA(val)}
          />
        )}
        {preprocessorParmas[2] && (
          <Number
            value={thresholdB}
            title={t(preprocessorParmas[2].name) || preprocessorParmas[2].name}
            min={preprocessorParmas[2].min}
            max={preprocessorParmas[2].max}
            step={preprocessorParmas[2].step}
            range={true}
            onChange={(val) => setThresholdB(val)}
          />
        )}
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
