import { observer } from 'mobx-react-lite'
import LunaTab, { LunaTabItem } from 'luna-tab/react'
import Style from './ControlNet.module.scss'
import map from 'licia/map'
import store from '../../store'
import { useRef, useState } from 'react'
import toStr from 'licia/toStr'
import { isFileDrop, notify, t, toDataUrl } from '../../../lib/util'
import toNum from 'licia/toNum'
import { Number, Row, Select } from '../../../components/setting'
import className from 'licia/className'
import InitImageStyle from './InitImage.module.scss'
import { toJS } from 'mobx'
import LunaImageViewer from 'luna-image-viewer/react'
import LunaToolbar, {
  LunaToolbarSeparator,
  LunaToolbarSpace,
} from 'luna-toolbar/react'
import ToolbarIcon from '../../../components/ToolbarIcon'
import openFile from 'licia/openFile'
import ImageViewer from 'luna-image-viewer'
import contextMenu from '../../../lib/contextMenu'
import { copyData } from '../../lib/util'
import each from 'licia/each'
import isEmpty from 'licia/isEmpty'
import clamp from 'licia/clamp'

export default observer(function ControlNet() {
  const { controlNetUnits, selectedControlNetUnit: selectedUnit } =
    store.project
  const [dropHighlight, setDropHighlight] = useState(false)
  const imageViewerRef = useRef<ImageViewer>()

  const tabItems = map(controlNetUnits, (unit, idx) => {
    return (
      <LunaTabItem
        key={idx}
        id={toStr(idx)}
        title={`${t('controlNetUnit')} ${idx + 1}`}
        selected={unit === selectedUnit}
      />
    )
  })

  const openImage = () => {
    openFile({
      accept: 'image/png,image/jpeg',
    }).then(async (fileList) => {
      const file = fileList[0]
      if (file) {
        selectedUnit.setImage(file)
      }
    })
  }

  const pasteImage = async () => {
    const image = await main.readClipboardImage()
    if (image) {
      selectedUnit.setImage(image, 'image/png')
    } else {
      notify(t('noClipboardImage'))
    }
  }

  const onImageContextMenu = (e: React.MouseEvent) => {
    const imageViewer = imageViewerRef.current!

    const template: any[] = [
      {
        label: t('reset'),
        click: () => imageViewer.reset(),
      },
      {
        label: t('originalSize'),
        click: () => imageViewer.zoomTo(1),
      },
      {
        label: t('zoomIn'),
        click: () => imageViewer.zoom(0.1),
      },
      {
        label: t('zoomOut'),
        click: () => imageViewer.zoom(-0.1),
      },
      {
        label: t('rotateLeft'),
        click: () => imageViewer.rotate(-90),
      },
      {
        label: t('rotateRight'),
        click: () => imageViewer.rotate(90),
      },
      {
        type: 'separator',
      },
      {
        label: t('copy'),
        click() {
          const image = selectedUnit.image!
          copyData(image.data, image.info.mime)
        },
      },
      {
        label: t('paste'),
        click: pasteImage,
      },
    ]

    contextMenu(e, template)
  }

  const onImageDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDropHighlight(false)
    if (isFileDrop(e)) {
      selectedUnit.setImage(e.dataTransfer.files[0])
    } else {
      const id = e.dataTransfer.getData('imageId')
      if (id) {
        const image = store.project.getImage(id)
        if (image) {
          selectedUnit.setImage(toJS(image))
        }
      }
    }
  }

  const onImageDragLeave = () => {
    setDropHighlight(false)
  }

  const onImageDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDropHighlight(true)
  }

  let controlTypes: any = {}
  let controlTypeDisabled = false
  let preprocessors: any = {
    [t('empty')]: 'empty',
  }

  if (!isEmpty(store.controlTypes)) {
    each(store.controlTypes, (controlType, name) => {
      if (name === 'All') {
        return
      }
      const value = name
      name = t(name) || name
      controlTypes[name] = value
    })

    const moduleList = store.controlTypes[selectedUnit.type].module_list
    preprocessors = {}
    each(moduleList, (name) => {
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

  let image = (
    <div
      className={className(InitImageStyle.empty, 'button', {
        [InitImageStyle.highlight]: dropHighlight,
      })}
      onClick={openImage}
      onContextMenu={(e: React.MouseEvent) => {
        contextMenu(e, [
          {
            label: t('paste'),
            click: pasteImage,
          },
        ])
      }}
      onDrop={onImageDrop}
      onDragLeave={onImageDragLeave}
      onDragOver={onImageDragOver}
    >
      {t('setImage')}
    </div>
  )

  let controlOptions: JSX.Element | null = null
  if (selectedUnit.image) {
    image = (
      <div
        className={InitImageStyle.initImage}
        style={{
          height: 200,
        }}
      >
        <LunaToolbar className={InitImageStyle.toolbar}>
          <ToolbarIcon
            icon="open-file"
            title={t('openImage')}
            onClick={openImage}
          />
          <LunaToolbarSeparator />
          <ToolbarIcon
            icon="explode"
            title={t('preprocess')}
            onClick={() => store.preprocessModal.show(selectedUnit.image!)}
          />
          <ToolbarIcon
            icon="magic"
            title={t('interrogate')}
            onClick={() => store.interrogateModal.show(selectedUnit.image!)}
          />
          <LunaToolbarSpace />
          <ToolbarIcon
            icon="delete"
            title={t('delete')}
            onClick={() => {
              selectedUnit.deleteImage()
              main.closePainter()
            }}
          />
        </LunaToolbar>
        <div
          className={className(InitImageStyle.imageViewer, {
            [InitImageStyle.highlight]: dropHighlight,
          })}
          onContextMenu={onImageContextMenu}
          onDrop={onImageDrop}
          onDragLeave={onImageDragLeave}
          onDragOver={onImageDragOver}
        >
          <LunaImageViewer
            image={toDataUrl(
              selectedUnit.image.data,
              selectedUnit.image.info.mime
            )}
            zoomOnWheel={false}
            onCreate={(imageViewer) => (imageViewerRef.current = imageViewer)}
          ></LunaImageViewer>
        </div>
      </div>
    )

    const preprocessorParams =
      store.controlModules[selectedUnit.preprocessor]?.sliders || []
    if (preprocessorParams[1]) {
      const param = preprocessorParams[1]
      const value = clamp(selectedUnit.thresholdA, param.min, param.max)
      if (value !== selectedUnit.thresholdA) {
        selectedUnit.setThresholdA(param.value)
      }
    }
    if (preprocessorParams[2]) {
      const param = preprocessorParams[2]
      const value = clamp(selectedUnit.thresholdB, param.min, param.max)
      if (value !== selectedUnit.thresholdB) {
        selectedUnit.setThresholdB(param.value)
      }
    }

    let preprecessorThresholds: JSX.Element | null = null
    if (preprocessorParams[1] || preprocessorParams[2]) {
      preprecessorThresholds = (
        <Row>
          {preprocessorParams[1] && (
            <Number
              value={selectedUnit.thresholdA}
              title={
                t(preprocessorParams[1].name) || preprocessorParams[1].name
              }
              min={preprocessorParams[1].min}
              max={preprocessorParams[1].max}
              step={preprocessorParams[1].step}
              range={true}
              onChange={(val) => selectedUnit.setThresholdA(val)}
            />
          )}
          {preprocessorParams[2] && (
            <Number
              value={selectedUnit.thresholdB}
              title={
                t(preprocessorParams[2].name) || preprocessorParams[2].name
              }
              min={preprocessorParams[2].min}
              max={preprocessorParams[2].max}
              step={preprocessorParams[2].step}
              range={true}
              onChange={(val) => selectedUnit.setThresholdB(val)}
            />
          )}
        </Row>
      )
    }

    controlOptions = (
      <>
        <Row>
          <Select
            value={selectedUnit.type}
            title={t('controlType')}
            options={controlTypes}
            disabled={controlTypeDisabled}
            onChange={(val) => {
              selectedUnit.setType(val)
              const controlType = store.controlTypes[val]
              selectedUnit.setPreprocessor(controlType.default_option)
            }}
          />
          <Number
            value={selectedUnit.weight}
            title={t('controlWeight')}
            min={0}
            max={2}
            step={0.01}
            range={true}
            onChange={(val) => selectedUnit.setWeight(val)}
          />
        </Row>
        <Row>
          <Number
            value={selectedUnit.guidanceStart}
            title={t('guidanceStart')}
            min={0}
            max={1}
            step={0.01}
            range={true}
            onChange={(val) => selectedUnit.setGuidanceStart(val)}
          />
          <Number
            value={selectedUnit.guidanceEnd}
            title={t('guidanceEnd')}
            min={0}
            max={1}
            step={0.01}
            range={true}
            onChange={(val) => selectedUnit.setGuidanceEnd(val)}
          />
        </Row>
        <Row>
          <Select
            value={selectedUnit.resizeMode}
            title={t('resizeMode')}
            options={{
              [t('justResize')]: 'Just Resize',
              [t('cropAndResize')]: 'Crop and Resize',
              [t('resizeAndFill')]: 'Resize and Fill',
            }}
            onChange={(val) => selectedUnit.setResizeMode(val)}
          />
          <Select
            value={selectedUnit.controlMode}
            title={t('controlMode')}
            options={{
              [t('balanced')]: 'Balanced',
              [t('promptImportant')]: 'My prompt is more important',
              [t('controlImportant')]: 'ControlNet is more important',
            }}
            onChange={(val) => selectedUnit.setControlMode(val)}
          />
        </Row>
        <Row>
          <Select
            value={selectedUnit.preprocessor}
            title={t('preprocessor')}
            options={preprocessors}
            disabled={controlTypeDisabled}
            onChange={(val) => selectedUnit.setPreprocessor(val)}
          />
          {preprocessorParams[0] && (
            <Number
              value={selectedUnit.resolution}
              title={t('width')}
              min={preprocessorParams[0].min}
              max={preprocessorParams[0].max}
              step={preprocessorParams[0].step}
              range={true}
              onChange={(val) => selectedUnit.setResolution(val)}
            />
          )}
        </Row>
        {preprecessorThresholds}
      </>
    )
  }

  return (
    <>
      <LunaTab
        className={Style.tab}
        height={30}
        onSelect={(idx) => {
          store.project.selectControlNetUnit(toNum(idx))
        }}
      >
        {tabItems}
      </LunaTab>
      <Row>{image}</Row>
      {controlOptions}
    </>
  )
})
