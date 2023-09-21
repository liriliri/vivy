import isEmpty from 'licia/isEmpty'
import each from 'licia/each'
import { observer } from 'mobx-react-lite'
import { t } from '../../../lib/util'
import store from '../../store'
import { Select, Row, Number } from '../../../components/setting'

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
    <>
      <Row>
        <Select
          value={txt2imgOptions.sampler}
          title={t('samplingMethod')}
          options={samplers}
          onChange={(val) => store.setTxt2ImgOptions('sampler', val)}
        />
        <Number
          value={txt2imgOptions.steps}
          title={t('samplingSteps')}
          min={1}
          max={50}
          onChange={(val) => store.setTxt2ImgOptions('steps', val)}
        />
      </Row>
      <Row>
        <Number
          value={txt2imgOptions.width}
          title={t('width')}
          min={64}
          max={2048}
          onChange={(val) => store.setTxt2ImgOptions('width', val)}
        />
        <Number
          value={txt2imgOptions.height}
          title={t('height')}
          min={64}
          max={2048}
          onChange={(val) => store.setTxt2ImgOptions('height', val)}
        />
      </Row>
      <Row>
        <Number
          value={txt2imgOptions.batchSize}
          title={t('batchSize')}
          min={1}
          max={8}
          range={true}
          onChange={(val) => store.setTxt2ImgOptions('batchSize', val)}
        />
        <Number
          value={txt2imgOptions.cfgScale}
          title={t('cfgScale')}
          min={1}
          max={30}
          range={true}
          onChange={(val) => store.setTxt2ImgOptions('cfgScale', val)}
        />
      </Row>
      <Row>
        <Number
          value={txt2imgOptions.seed}
          title={t('seed')}
          onChange={(val) => store.setTxt2ImgOptions('seed', val)}
        />
      </Row>
    </>
  )
})
