import isEmpty from 'licia/isEmpty'
import each from 'licia/each'
import { observer } from 'mobx-react-lite'
import { t } from '../../../lib/util'
import store from '../../store'
import { Select, Row, Number } from '../../../components/setting'
import SettingStyle from '../../../components/setting.module.scss'
import Style from './GenOptions.module.scss'
import InitImage from './InitImage'
import { StatusbarDesc } from '../statusbar/Statusbar'
import toStr from 'licia/toStr'
import toNum from 'licia/toNum'
import toBool from 'licia/toBool'
import className from 'licia/className'

export default observer(function () {
  const { project } = store
  const { genOptions } = project

  let samplers: any = {}
  if (!isEmpty(project.samplers)) {
    each(project.samplers, (sampler) => {
      samplers[sampler] = sampler
    })
  } else {
    samplers = {
      [t('empty')]: 'empty',
    }
  }

  let img2imgOptions: JSX.Element | null = null
  if (project.initImage) {
    img2imgOptions = (
      <>
        <Row>
          <Select
            value={toStr(genOptions.resizeMode)}
            title={t('resizeMode')}
            options={{
              [t('justResize')]: '0',
              [t('cropAndResize')]: '1',
              [t('resizeAndFill')]: '2',
            }}
            onChange={(val) => project.setGenOption('resizeMode', toNum(val))}
          />
          <StatusbarDesc
            className={SettingStyle.item}
            desc={t('denoisingStrengthDesc')}
          >
            <Number
              value={genOptions.denoisingStrength}
              title={t('denoisingStrength')}
              min={0}
              max={1}
              step={0.01}
              range={true}
              onChange={(val) => project.setGenOption('denoisingStrength', val)}
            />
          </StatusbarDesc>
        </Row>
      </>
    )
  }

  let maskOptions: JSX.Element | null = null
  if (project.initImageMask) {
    let onlyMaskedPadding: JSX.Element | null = null
    if (genOptions.inpaintFull) {
      onlyMaskedPadding = (
        <Row>
          <Number
            value={genOptions.inpaintFullPadding}
            title={t('onlyMaskedPadding')}
            min={0}
            max={256}
            step={1}
            range={true}
            onChange={(val) => project.setGenOption('inpaintFullPadding', val)}
          />
        </Row>
      )
    }

    maskOptions = (
      <>
        <Row>
          <Select
            value={genOptions.maskInvert ? '1' : '0'}
            title={t('maskMode')}
            options={{
              [t('inpaintMasked')]: '0',
              [t('inpaintNotMasked')]: '1',
            }}
            onChange={(val) => project.setGenOption('maskInvert', toBool(val))}
          />
          <Number
            value={genOptions.maskBlur}
            title={t('maskBlur')}
            min={0}
            max={64}
            step={1}
            range={true}
            onChange={(val) => project.setGenOption('maskBlur', val)}
          />
        </Row>
        <Row>
          <Select
            value={toStr(genOptions.inpaintFill)}
            title={t('maskedContent')}
            options={{
              [t('fill')]: '0',
              [t('original')]: '1',
              [t('latentNoise')]: '2',
              [t('latentNothing')]: '3',
            }}
            onChange={(val) => project.setGenOption('inpaintFill', toNum(val))}
          />
          <Select
            value={genOptions.inpaintFull ? '1' : '0'}
            title={t('inpaintArea')}
            options={{
              [t('wholePicture')]: '0',
              [t('onlyMasked')]: '1',
            }}
            onChange={(val) => project.setGenOption('inpaintFull', toBool(val))}
          />
        </Row>
        {onlyMaskedPadding}
      </>
    )
  }

  return (
    <>
      <Row>
        <InitImage />
      </Row>
      {img2imgOptions}
      {maskOptions}
      <Row>
        <Select
          value={genOptions.sampler}
          title={t('samplingMethod')}
          options={samplers}
          disabled={isEmpty(samplers)}
          onChange={(val) => project.setGenOption('sampler', val)}
        />
        <StatusbarDesc
          className={SettingStyle.item}
          desc={t('samplingStepsDesc')}
        >
          <Number
            value={genOptions.steps}
            title={t('samplingSteps')}
            min={1}
            max={50}
            onChange={(val) => project.setGenOption('steps', val)}
          />
        </StatusbarDesc>
      </Row>
      <Row>
        <Number
          value={genOptions.width}
          title={t('width')}
          min={64}
          max={2048}
          onChange={(val) => project.setGenOption('width', val)}
        />
        <Number
          value={genOptions.height}
          title={t('height')}
          min={64}
          max={2048}
          onChange={(val) => project.setGenOption('height', val)}
        />
      </Row>
      <Row>
        <StatusbarDesc className={SettingStyle.item} desc={t('cfgScaleDesc')}>
          <Number
            value={genOptions.cfgScale}
            title={t('cfgScale')}
            min={1}
            max={30}
            range={true}
            onChange={(val) => project.setGenOption('cfgScale', val)}
          />
        </StatusbarDesc>
        <StatusbarDesc className={SettingStyle.item} desc={t('clipSkipDesc')}>
          <Number
            value={genOptions.clipSkip}
            title={t('clipSkip')}
            min={1}
            max={12}
            range={true}
            onChange={(val) => project.setGenOption('clipSkip', val)}
          />
        </StatusbarDesc>
      </Row>
      <Row>
        <div
          className={className('icon', Style.randomSeed)}
          onClick={() => project.setGenOption('seed', -1)}
        >
          <span className="icon-dice" title={t('randomSeed')} />
        </div>
        <StatusbarDesc className={SettingStyle.item} desc={t('seedDesc')}>
          <Number
            value={genOptions.seed}
            title={t('seed')}
            onChange={(val) => project.setGenOption('seed', val)}
          />
        </StatusbarDesc>
      </Row>
    </>
  )
})
