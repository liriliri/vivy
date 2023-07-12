import { useRef, useEffect } from 'react'
import LunaSetting, {
  LunaSettingNumber,
  LunaSettingSelect,
} from 'luna-setting/react'
import { observer } from 'mobx-react-lite'
import className from 'licia/className'
import store from '../../store'
import Style from './Sidebar.module.scss'
import { autorun } from 'mobx'
import isEmpty from 'licia/isEmpty'
import each from 'licia/each'
import { i18n } from '../../../lib/util'

export default observer(function () {
  const { txt2imgOptions } = store

  let samplers: any = {}
  if (!isEmpty(store.samplers)) {
    each(store.samplers, (sampler) => {
      samplers[sampler] = sampler
    })
  } else {
    samplers = {
      [i18n.t('loading')]: 'loading',
    }
  }

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
      <LunaSetting onChange={(key, val) => store.setTxt2ImgOptions(key, val)}>
        <LunaSettingSelect
          keyName="sampler"
          value={txt2imgOptions.sampler}
          title={i18n.t('samplingMethod')}
          options={samplers}
        />
        <LunaSettingNumber
          keyName="steps"
          value={txt2imgOptions.steps}
          title={i18n.t('samplingSteps')}
          options={{
            min: 1,
            max: 50,
          }}
        />
        <LunaSettingNumber
          keyName="width"
          value={txt2imgOptions.width}
          title={i18n.t('width')}
          options={{
            min: 64,
            max: 2048,
          }}
        />
        <LunaSettingNumber
          keyName="height"
          value={txt2imgOptions.height}
          title={i18n.t('height')}
          options={{
            min: 64,
            max: 2048,
          }}
        />
        <LunaSettingNumber
          keyName="batchSize"
          value={txt2imgOptions.batchSize}
          title={i18n.t('batchSize')}
          options={{
            range: true,
            min: 1,
            max: 8,
          }}
        />
        <LunaSettingNumber
          keyName="cfgScale"
          value={txt2imgOptions.cfgScale}
          title={i18n.t('cfgScale')}
          options={{
            range: true,
            min: 1,
            max: 30,
          }}
        />
        <LunaSettingNumber
          keyName="seed"
          value={txt2imgOptions.seed}
          title={i18n.t('seed')}
          options={{}}
        />
      </LunaSetting>
    </div>
  )
})
