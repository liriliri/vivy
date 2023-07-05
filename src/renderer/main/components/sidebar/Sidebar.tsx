import { useRef, useEffect } from 'react'
import LunaSetting from 'luna-setting'
import { observer } from 'mobx-react-lite'
import className from 'licia/className'
import store from '../../store'
import Style from './Sidebar.module.scss'
import { autorun } from 'mobx'
import isEmpty from 'licia/isEmpty'
import each from 'licia/each'
import { i18n } from '../../../lib/util'

export default observer(function () {
  const txt2imgOptionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const setting = new LunaSetting(txt2imgOptionsRef.current as HTMLDivElement)
    setting.on('change', (key, val) => {
      store.setTxt2ImgOptions(key, val)
    })
    autorun(() => {
      setting.clear()
      const txt2imgOptions = store.txt2imgOptions
      if (!isEmpty(store.samplers)) {
        const options = {}
        each(store.samplers, (sampler) => {
          options[sampler] = sampler
        })
        setting.appendSelect(
          'sampler',
          txt2imgOptions.sampler,
          i18n.t('samplingMethod'),
          options
        )
      } else {
        setting.appendSelect('sampler', 'loading', i18n.t('samplingMethod'), {
          [i18n.t('loading')]: 'loading',
        })
      }
      setting.appendNumber(
        'steps',
        txt2imgOptions.steps,
        i18n.t('samplingSteps'),
        {
          min: 1,
          max: 50,
        }
      )
      setting.appendNumber('width', txt2imgOptions.width, i18n.t('width'), {
        min: 64,
        max: 2048,
      })
      setting.appendNumber('height', txt2imgOptions.height, i18n.t('height'), {
        min: 64,
        max: 2048,
      })
      setting.appendNumber(
        'batchSize',
        txt2imgOptions.batchSize,
        i18n.t('batchSize'),
        {
          range: true,
          min: 1,
          max: 8,
        }
      )
      setting.appendNumber(
        'cfgScale',
        txt2imgOptions.cfgScale,
        i18n.t('cfgScale'),
        {
          range: true,
          min: 1,
          max: 30,
        }
      )
      setting.appendNumber('seed', txt2imgOptions.seed, i18n.t('seed'), {})
    })
    return () => setting.destroy()
  }, [])

  return (
    <div className={Style.sidebar}>
      <div className={Style.generateBasic}>
        <div className={Style.prompt}>
          <textarea
            placeholder={i18n.t('prompt')}
            spellCheck="false"
            value={store.txt2imgOptions.prompt}
            onChange={(e) => {
              store.setTxt2ImgOptions('prompt', e.target.value)
            }}
          />
        </div>
        <div className={Style.negativePrompt}>
          <textarea
            placeholder={i18n.t('negativePrompt')}
            spellCheck="false"
            value={store.txt2imgOptions.negativePrompt}
            onChange={(e) => {
              store.setTxt2ImgOptions('negativePrompt', e.target.value)
            }}
          />
        </div>
        <button
          className={className(Style.generate, 'button')}
          onClick={() => store.createTask()}
        >
          {i18n.t('generate')}
        </button>
      </div>
      <div ref={txt2imgOptionsRef} className="generate-setting"></div>
    </div>
  )
})
