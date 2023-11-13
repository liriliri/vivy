import isEmpty from 'licia/isEmpty'
import each from 'licia/each'
import { observer } from 'mobx-react-lite'
import { t } from '../../../lib/util'
import store from '../../store'
import { Select, Row, Number } from '../../../components/setting'

export default observer(function () {
  const { genOptions } = store

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
    <>
      <Row>
        <Select
          value={genOptions.sampler}
          title={t('samplingMethod')}
          options={samplers}
          onChange={(val) => store.setGenOptions('sampler', val)}
        />
        <Number
          value={genOptions.steps}
          title={t('samplingSteps')}
          min={1}
          max={50}
          onChange={(val) => store.setGenOptions('steps', val)}
        />
      </Row>
      <Row>
        <Number
          value={genOptions.width}
          title={t('width')}
          min={64}
          max={2048}
          onChange={(val) => store.setGenOptions('width', val)}
        />
        <Number
          value={genOptions.height}
          title={t('height')}
          min={64}
          max={2048}
          onChange={(val) => store.setGenOptions('height', val)}
        />
      </Row>
      <Row>
        <Number
          value={genOptions.batchSize}
          title={t('batchSize')}
          min={1}
          max={8}
          range={true}
          onChange={(val) => store.setGenOptions('batchSize', val)}
        />
        <Number
          value={genOptions.cfgScale}
          title={t('cfgScale')}
          min={1}
          max={30}
          range={true}
          onChange={(val) => store.setGenOptions('cfgScale', val)}
        />
      </Row>
      <Row>
        <Number
          value={genOptions.seed}
          title={t('seed')}
          onChange={(val) => store.setGenOptions('seed', val)}
        />
      </Row>
    </>
  )
})
