import LunaSetting, {
  LunaSettingNumber,
  LunaSettingSelect,
} from 'luna-setting/react'
import isEmpty from 'licia/isEmpty'
import each from 'licia/each'
import { observer } from 'mobx-react-lite'
import { t } from '../../../lib/util'
import store from '../../store'

export default observer(function () {
  const { txt2imgOptions } = store

  let samplers: any = {}
  if (!isEmpty(store.samplers)) {
    each(store.samplers, (sampler) => {
      samplers[sampler] = sampler
    })
  } else {
    samplers = {
      [t('loading')]: 'loading',
    }
  }

  return (
    <LunaSetting onChange={(key, val) => store.setTxt2ImgOptions(key, val)}>
      <LunaSettingSelect
        keyName="sampler"
        value={txt2imgOptions.sampler}
        title={t('samplingMethod')}
        options={samplers}
      />
      <LunaSettingNumber
        keyName="steps"
        value={txt2imgOptions.steps}
        title={t('samplingSteps')}
        options={{
          min: 1,
          max: 50,
        }}
      />
      <LunaSettingNumber
        keyName="width"
        value={txt2imgOptions.width}
        title={t('width')}
        options={{
          min: 64,
          max: 2048,
        }}
      />
      <LunaSettingNumber
        keyName="height"
        value={txt2imgOptions.height}
        title={t('height')}
        options={{
          min: 64,
          max: 2048,
        }}
      />
      <LunaSettingNumber
        keyName="batchSize"
        value={txt2imgOptions.batchSize}
        title={t('batchSize')}
        options={{
          range: true,
          min: 1,
          max: 8,
        }}
      />
      <LunaSettingNumber
        keyName="cfgScale"
        value={txt2imgOptions.cfgScale}
        title={t('cfgScale')}
        options={{
          range: true,
          min: 1,
          max: 30,
        }}
      />
      <LunaSettingNumber
        keyName="seed"
        value={txt2imgOptions.seed}
        title={t('seed')}
        options={{}}
      />
    </LunaSetting>
  )
})
