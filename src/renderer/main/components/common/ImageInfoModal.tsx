import LunaModal from 'luna-modal/react'
import { observer } from 'mobx-react-lite'
import { createPortal } from 'react-dom'
import { t } from 'common/util'
import copy from 'licia/copy'
import className from 'licia/className'
import LunaDataGrid from 'luna-data-grid/react'
import { IImage } from '../../store/types'
import { useState } from 'react'
import TextGroup from './TextGroup'

interface IProps {
  visible: boolean
  image: IImage
  onClose: () => void
}

export default observer(function ImageInfoModal(props: IProps) {
  const [showSuccess, setShowSuccess] = useState(false)

  const info = props.image.info

  const data: any = []
  const addData = (parameter, value) => data.push({ parameter, value })
  if (info.steps) {
    addData(t('samplingSteps'), info.steps)
  }
  if (info.sampler) {
    addData(t('samplingMethod'), info.sampler)
  }
  if (info.scheduler) {
    addData(t('scheduleType'), info.scheduler)
  }
  if (info.cfgScale) {
    addData(t('cfgScale'), info.cfgScale)
  }
  if (info.clipSkip) {
    addData(t('clipSkip'), info.clipSkip)
  }
  if (info.seed) {
    addData(t('seed'), info.seed)
  }

  const copyGenData = () => {
    const text: string[] = []
    if (info.prompt) {
      text.push(info.prompt)
    }
    if (info.negativePrompt) {
      text.push(`Negative prompt: ${info.negativePrompt}`)
    }
    const parameters: string[] = []
    if (info.steps) {
      parameters.push(`Steps: ${info.steps}`)
    }
    parameters.push(`Size: ${info.width}x${info.height}`)
    if (info.seed) {
      parameters.push(`Seed: ${info.seed}`)
    }
    if (info.sampler) {
      parameters.push(`Sampler: ${info.sampler}`)
    }
    if (info.scheduler) {
      parameters.push(`Schedule type: ${info.scheduler}`)
    }
    if (info.cfgScale) {
      parameters.push(`CFG scale: ${info.cfgScale}`)
    }
    if (info.clipSkip) {
      parameters.push(`Clip skip: ${info.clipSkip}`)
    }
    text.push(parameters.join(', '))
    copy(text.join('\n'))
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 1000)
  }

  return createPortal(
    <LunaModal
      title={t('imageInfo')}
      visible={props.visible}
      width={640}
      onClose={props.onClose}
    >
      {info.prompt && <TextGroup title={t('prompt')} content={info.prompt} />}
      {info.negativePrompt && (
        <TextGroup title={t('negativePrompt')} content={info.negativePrompt} />
      )}
      <LunaDataGrid
        columns={[
          {
            id: 'parameter',
            title: t('parameter'),
          },
          {
            id: 'value',
            title: t('value'),
          },
        ]}
        data={data}
        minHeight={41}
      />
      <div
        className={className('modal-button', 'button', 'primary')}
        onMouseDown={(e) => e.preventDefault()}
        onClick={copyGenData}
      >
        {t(showSuccess ? 'copied' : 'copyGenData')}
      </div>
    </LunaModal>,
    document.body
  )
})
