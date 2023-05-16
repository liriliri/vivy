import { useRef, useEffect } from 'react'
import LunaSetting from 'luna-setting'
import { observer } from 'mobx-react-lite'
import store from '../../store'
import './Sidebar.scss'
import { autorun } from 'mobx'

export default observer(function () {
  const txt2imgOptionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const setting = new LunaSetting(txt2imgOptionsRef.current as HTMLDivElement)
    setting.on('change', (key, val) => {
      store.updateTxt2ImgOptions(key, val)
    })
    autorun(() => {
      setting.clear()
      const txt2imgOptions = store.txt2imgOptions
      setting.appendSelect(
        'sampler',
        txt2imgOptions.sampler,
        'Sampling Method',
        {
          'Euler a': 'Euler a',
          Euler: 'Euler',
          LMS: 'LMS',
          Heun: 'Heun',
          DPM2: 'DPM2',
          'DPM2 a': 'DPM2 a',
          'DPM++ 2S a': 'DPM++ 2S a',
          'DPM++ 2M': 'DPM++ 2M',
          'DPM++ SDE': 'DPM++ SDE',
          'DPM fast': 'DPM fast',
          'DPM adaptive': 'DPM adaptive',
          'LMS Karras': 'LMS Karras',
          'DPM2 Karras': 'DPM2 Karras',
          'DPM2 a Karras': 'DPM2 a Karras',
          'DPM++ 2S a Karras': 'DPM++ 2S a Karras',
          'DPM++ 2M Karras': 'DPM++ 2M Karras',
          'DPM++ SDE Karras': 'DPM++ SDE Karras',
          DDIM: 'DDIM',
          PLMS: 'PLMS',
          UniPC: 'UniPC',
        }
      )
      setting.appendNumber('steps', txt2imgOptions.steps, 'Sampling Steps', {})
      setting.appendNumber('width', txt2imgOptions.width, 'Width', {
        range: true,
        min: 64,
        max: 2048,
      })
      setting.appendNumber('height', txt2imgOptions.height, 'Height', {
        range: true,
        min: 64,
        max: 2048,
      })
      setting.appendNumber(
        'batchSize',
        txt2imgOptions.batchSize,
        'Batch Size',
        {
          range: true,
          min: 1,
          max: 8,
        }
      )
      setting.appendNumber('cfgScale', txt2imgOptions.cfgScale, 'CFG Scale', {
        range: true,
        min: 1,
        max: 30,
      })
      setting.appendNumber('seed', txt2imgOptions.seed, 'Seed', {})
    })
    return () => setting.destroy()
  }, [])

  return (
    <div id="sidebar">
      <div className="generate-basic">
        <div className="prompt">
          <textarea
            placeholder="Prompt"
            value={store.txt2imgOptions.prompt}
            onChange={(e) => {
              store.updateTxt2ImgOptions('prompt', e.target.value)
            }}
          />
        </div>
        <div className="negative-prompt">
          <textarea
            placeholder="Negative Prompt"
            value={store.txt2imgOptions.negativePrompt}
            onChange={(e) => {
              store.updateTxt2ImgOptions('negativePrompt', e.target.value)
            }}
          />
        </div>
        <button className="generate button" onClick={() => store.createTask()}>
          Generate
        </button>
      </div>
      <div ref={txt2imgOptionsRef} className="generate-setting"></div>
    </div>
  )
})
