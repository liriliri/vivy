import { observer } from 'mobx-react-lite'
import LunaModal from 'luna-modal/react'
import { createPortal } from 'react-dom'
import { notify } from 'share/renderer/lib/util'
import { t } from 'common/util'
import { Number, Row, Select } from 'share/renderer/components/setting'
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
  LunaToolbarSpace,
} from 'luna-toolbar/react'
import ToolbarIcon from 'share/renderer/components/ToolbarIcon'
import LunaImageViewer from 'luna-image-viewer/react'
import ImageViewer from 'luna-image-viewer'
import { LoadingCircle } from 'share/renderer/components/loading'
import * as webui from '../../../lib/webui'
import clamp from 'licia/clamp'
import toBool from 'licia/toBool'
import convertBin from 'licia/convertBin'
import download from 'licia/download'
import CopyButton from 'share/renderer/components/CopyButton'
import { copyData } from '../../lib/util'
import startWith from 'licia/startWith'
import contain from 'licia/contain'
import { checkPreprocessModel, downloadModels } from '../../lib/model'
import map from 'licia/map'
import range from 'licia/range'
import dataUrl from 'licia/dataUrl'

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
    type: string
    preprocessor: string
  }>({
    data: '',
    type: 'All',
    preprocessor: 'none',
  })
  const imageViewerRef = useRef<ImageViewer>(null)

  useEffect(() => {
    if (props.visible) {
      setProcessedImage({
        data: '',
        type: 'All',
        preprocessor: 'none',
      })
      const width = props.image.info.width
      setResolution(clamp(width, 64, 512))
    }
  }, [props.visible])

  const preprocessorParams = store.controlModules[preprocessor]?.sliders || []
  if (preprocessorParams[1]) {
    const param = preprocessorParams[1]
    const value = clamp(thresholdA, param.min, param.max)
    if (value !== thresholdA) {
      setThresholdA(param.value)
    }
  }
  if (preprocessorParams[2]) {
    const param = preprocessorParams[2]
    const value = clamp(thresholdB, param.min, param.max)
    if (value !== thresholdB) {
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

    if (!(await downloadModels(checkPreprocessModel(preprocessor)))) {
      return
    }

    setIsProcessing(true)
    try {
      const options: any = {
        controlnet_module: preprocessor,
        controlnet_input_images: [props.image.data],
      }
      if (preprocessorParams[0]) {
        options.controlnet_processor_res = resolution
      }
      if (preprocessorParams[1]) {
        options.controlnet_threshold_a = thresholdA
      }
      if (preprocessorParams[2]) {
        options.controlnet_threshold_b = thresholdB
      }
      const image = await webui.preprocess(options)
      setProcessedImage({
        data: image,
        type: controlType,
        preprocessor,
      })
    } catch {
      notify(t('generateErr'), { icon: 'error' })
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

  const setControlNetImage = (idx: number) => {
    const { project } = store
    const unit = project.controlNetUnits[idx]
    unit.setImage(processedImage.data)
    unit.setType(processedImage.type)
    unit.setPreprocessor('none')
    project.selectControlNetUnit(idx)
  }

  let image = ''
  if (processedImage.data) {
    image = dataUrl.stringify(processedImage.data, 'image/png')
  } else {
    image = dataUrl.stringify(props.image.data, props.image.info.mime)
  }

  const controlNetUnitBtns = map(range(3), (val) => {
    return (
      <LunaToolbarButton
        key={val}
        disabled={!toBool(processedImage.data)}
        state="hover"
        onClick={() => setControlNetImage(val)}
      >
        <span
          className={Style.toolbarNumber}
          title={`${t('controlNetUnit')} ${val + 1}`}
        >
          {val + 1}
        </span>
      </LunaToolbarButton>
    )
  })

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
          <LunaToolbarSpace />
          {controlNetUnitBtns}
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
        {preprocessorParams[0] && (
          <Number
            value={resolution}
            title={t('width')}
            min={preprocessorParams[0].min}
            max={preprocessorParams[0].max}
            step={preprocessorParams[0].step}
            range={true}
            onChange={(val) => setResolution(val)}
          />
        )}
        {preprocessorParams[1] && (
          <Number
            value={thresholdA}
            title={t(preprocessorParams[1].name) || preprocessorParams[1].name}
            min={preprocessorParams[1].min}
            max={preprocessorParams[1].max}
            step={preprocessorParams[1].step}
            range={true}
            onChange={(val) => setThresholdA(val)}
          />
        )}
        {preprocessorParams[2] && (
          <Number
            value={thresholdB}
            title={t(preprocessorParams[2].name) || preprocessorParams[2].name}
            min={preprocessorParams[2].min}
            max={preprocessorParams[2].max}
            step={preprocessorParams[2].step}
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
