import LunaModal from 'luna-modal/react'
import { observer } from 'mobx-react-lite'
import { createPortal } from 'react-dom'
import { t } from '../../../lib/util'
import Style from './ImageInfoModal.module.scss'
import copy from 'licia/copy'
import className from 'licia/className'
import CopyButton from '../../../components/CopyButton'
import LunaDataGrid from 'luna-data-grid/react'
import { IImage } from '../../store/types'
import { useState } from 'react'

interface IProps {
  visible: boolean
  image: IImage
  onClose?: () => void
}

export default observer(function ImageInfoModal(props: IProps) {
  const [showSuccess, setShowSuccess] = useState(false)

  const info = props.image.info
  const prompt = info.prompt ? (
    <div className={Style.group}>
      <div className={Style.title}>{t('prompt')}</div>
      <CopyButton className={Style.copy} onClick={() => copy(info.prompt!)} />
      <div className={Style.content}>{info.prompt}</div>
    </div>
  ) : null
  const negativePrompt = info.negativePrompt ? (
    <div className={Style.group}>
      <div className={Style.title}>{t('negativePrompt')}</div>
      <CopyButton
        className={Style.copy}
        onClick={() => copy(info.negativePrompt!)}
      />
      <div className={Style.content}>{info.negativePrompt}</div>
    </div>
  ) : null

  const data: any = []
  const addData = (parameter, value) => data.push({ parameter, value })
  if (info.sampler) {
    addData(t('samplingMethod'), info.sampler)
  }
  if (info.steps) {
    addData(t('samplingSteps'), info.steps)
  }
  if (info.cfgScale) {
    addData(t('cfgScale'), info.cfgScale)
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
    if (info.cfgScale) {
      parameters.push(`CFG scale: ${info.cfgScale}`)
    }
    text.push(parameters.join(', '))
    copy(text.join('\n'))
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 1000)
  }

  const content = (
    <>
      {prompt}
      {negativePrompt}
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
        className={className(
          Style.copyData,
          'button',
          showSuccess ? 'success' : 'primary'
        )}
        onMouseDown={(e) => e.preventDefault()}
        onClick={copyGenData}
      >
        {t(showSuccess ? 'copied' : 'copyGenData')}
      </div>
    </>
  )

  return createPortal(
    <LunaModal
      title={t('imageInfo')}
      visible={props.visible}
      width={640}
      onClose={props.onClose}
    >
      {content}
    </LunaModal>,
    document.body
  )
})
