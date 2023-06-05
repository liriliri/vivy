import { useRef, useEffect } from 'react'
import LunaSetting from 'luna-setting'
import { observer } from 'mobx-react-lite'
import store from '../../store'
import './Sidebar.scss'
import { autorun } from 'mobx'
import isEmpty from 'licia/isEmpty'
import each from 'licia/each'

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
          'Sampling Method',
          options
        )
      } else {
        setting.appendSelect('sampler', 'loading', 'Sampling Method', {
          loading: 'loading',
        })
      }
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
            spellCheck="false"
            value={store.txt2imgOptions.prompt}
            onChange={(e) => {
              store.setTxt2ImgOptions('prompt', e.target.value)
            }}
          />
        </div>
        <div className="negative-prompt">
          <textarea
            placeholder="Negative Prompt"
            spellCheck="false"
            value={store.txt2imgOptions.negativePrompt}
            onChange={(e) => {
              store.setTxt2ImgOptions('negativePrompt', e.target.value)
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
