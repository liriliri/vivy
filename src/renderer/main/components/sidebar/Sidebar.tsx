import LunaSetting, {
  LunaSettingNumber,
  LunaSettingSelect,
} from 'luna-setting/react'
import { observer } from 'mobx-react-lite'
import className from 'licia/className'
import store from '../../store'
import Style from './Sidebar.module.scss'
import isEmpty from 'licia/isEmpty'
import each from 'licia/each'
import { t } from '../../../lib/util'
import { useCallback, useRef, useState } from 'react'

export default observer(function () {
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [resizerStyle, setResizerStyle] = useState<any>({
    width: '10px',
  })
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

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const startX = e.clientX
    const width = sidebarRef.current!.offsetWidth
    setResizerStyle({
      position: 'fixed',
      width: '100%',
      height: '100%',
    })

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = startX - e.clientX
      sidebarRef.current!.style.width = `${width - deltaX}px`
    }

    const onMouseUp = (e: MouseEvent) => {
      setResizerStyle({
        width: '10px',
      })
      const deltaX = startX - e.clientX
      store.setUi('sidebarWidth', width - deltaX)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [])

  return (
    <div
      className={Style.sidebar}
      ref={sidebarRef}
      style={{ width: store.ui.sidebarWidth }}
    >
      <div
        className={Style.resizer}
        style={resizerStyle}
        onMouseDown={onMouseDown}
      ></div>
      <div className={Style.generateBasic}>
        <div className={Style.prompt}>
          <textarea
            placeholder={t('prompt')}
            spellCheck="false"
            value={store.txt2imgOptions.prompt}
            onChange={(e) => {
              store.setTxt2ImgOptions('prompt', e.target.value)
            }}
          />
        </div>
        <div className={Style.negativePrompt}>
          <textarea
            placeholder={t('negativePrompt')}
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
          {t('generate')}
        </button>
      </div>
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
    </div>
  )
})
