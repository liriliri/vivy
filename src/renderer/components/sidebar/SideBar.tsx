import { useRef, useEffect } from 'react'
import LunaSetting from 'luna-setting'
import { observer } from 'mobx-react-lite'
import store from '../../store'
import './Sidebar.scss'
import { autorun } from 'mobx'

export default observer(function () {
  const generateSettingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const setting = new LunaSetting(
      generateSettingRef.current as HTMLDivElement
    )
    setting.on('change', (key, val) => {
      store.updateGenerateSetting(key, val)
    })
    autorun(() => {
      setting.clear()
      setting.appendNumber(
        'inferenceSteps',
        store.generateSetting.inferenceSteps,
        'Inference Steps',
        {}
      )
      const generateSetting = store.generateSetting
      setting.appendNumber('seed', generateSetting.seed, 'Seed', {})
      setting.appendNumber('width', generateSetting.width, 'Width', {})
      setting.appendNumber('height', generateSetting.height, 'height', {})
      setting.appendSelect('sampler', generateSetting.sampler, 'Sampler', {
        PLMS: 'plms',
        DDIM: 'ddim',
        Heun: 'heun',
        Euler: 'euler',
      })
    })
    return () => setting.destroy()
  }, [])

  return (
    <div id="sidebar">
      <div className="generate-basic">
        <div className="prompt">
          <textarea
            placeholder="Prompt"
            value={store.generateSetting.prompt}
            onChange={(e) => {
              store.updateGenerateSetting('prompt', e.target.value)
            }}
          />
        </div>
        <div className="negative-prompt">
          <textarea
            placeholder="Negative Prompt"
            value={store.generateSetting.negativePrompt}
            onChange={(e) => {
              store.updateGenerateSetting('negativePrompt', e.target.value)
            }}
          />
        </div>
        <button
          className="generate-image button"
          onClick={() => store.generateImage()}
        >
          Generate Image
        </button>
      </div>
      <div ref={generateSettingRef} className="generate-setting"></div>
    </div>
  )
})
