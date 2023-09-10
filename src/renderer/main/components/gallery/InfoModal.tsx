import LunaModal from 'luna-modal/react'
import { observer } from 'mobx-react-lite'
import { createPortal } from 'react-dom'
import { t } from '../../../lib/util'
import store from '../../store'
import Style from './InfoModal.module.scss'
import copy from 'licia/copy'
import className from 'licia/className'
import CopyButton from '../../../components/CopyButton'
import LunaDataGrid from 'luna-data-grid/react'

interface IProps {
  visible: boolean
  onClose?: () => void
}

export default observer(function InfoModal(props: IProps) {
  let content: JSX.Element | null = null

  if (store.selectedImage?.info) {
    const info = store.selectedImage.info
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
      let parameters: string[] = []
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
    }

    content = (
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
        <button
          className={className(Style.copyData, 'button')}
          onMouseDown={(e) => e.preventDefault()}
          onClick={copyGenData}
        >
          {t('copyGenData')}
        </button>
      </>
    )
  }

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
