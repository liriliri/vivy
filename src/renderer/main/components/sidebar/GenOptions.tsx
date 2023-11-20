import isEmpty from 'licia/isEmpty'
import each from 'licia/each'
import { observer } from 'mobx-react-lite'
import { t } from '../../../lib/util'
import store from '../../store'
import { Select, Row, Number } from '../../../components/setting'
import Style from './GenOptions.module.scss'
import InitImage from './InitImage'

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

  let img2imgOptions: JSX.Element | null = null
  if (store.initImage) {
    img2imgOptions = (
      <>
        <Row>
          <Number
            value={genOptions.denoisingStrength}
            title={t('denoisingStrength')}
            min={0}
            max={1}
            step={0.01}
            range={true}
            onChange={(val) => store.setGenOptions('denoisingStrength', val)}
          />
        </Row>
      </>
    )
  }

  return (
    <div className={Style.genOptions}>
      <Row>
        <InitImage />
      </Row>
      {img2imgOptions}
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
    </div>
  )
})
