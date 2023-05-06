import { useRef, useEffect } from 'react'
import LunaSetting from 'luna-setting'
import './Sidebar.scss'

export default function () {
  const generateSettingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const setting = new LunaSetting(
      generateSettingRef.current as HTMLDivElement
    )
    setting.appendNumber('inferenceSteps', 35, 'Inference Steps', {})
    setting.appendNumber('seed', -1, 'Seed', {})
    setting.appendNumber('width', 512, 'Width', {})
    setting.appendNumber('height', 512, 'height', {})
    setting.appendSelect('sampler', 'Euler', 'Sampler', {
      Euler: 'euler',
    })
  }, [])

  return (
    <div id="sidebar">
      <div className="generate-basic">
        <div className="prompt">
          <textarea placeholder="Prompt" />
        </div>
        <div className="negative-prompt">
          <textarea placeholder="Negative Prompt" />
        </div>
        <button className="generate-image button">Generate Image</button>
      </div>
      <div ref={generateSettingRef} className="generate-setting"></div>
    </div>
  )
}
