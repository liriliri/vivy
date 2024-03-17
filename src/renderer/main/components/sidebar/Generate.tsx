import className from 'licia/className'
import Style from './Generate.module.scss'
import store from '../../store'
import { t } from '../../../lib/util'
import { observer } from 'mobx-react-lite'
import clamp from 'licia/clamp'
import toStr from 'licia/toStr'
import $ from 'licia/$'
import contextMenu from '../../../lib/contextMenu'
import { useRef } from 'react'

export default observer(function Generate() {
  const batchSizeRef = useRef<HTMLDivElement>(null)
  const { project } = store
  const { genOptions } = project

  function setBatchSize(size: number) {
    size = clamp(size, 1, 8)
    project.setGenOption('batchSize', size)
  }

  const onBatchSizeClick = function () {
    const template: any[] = []
    for (let i = 1; i < 9; i++) {
      const n = i
      template.push({
        label: toStr(n),
        click() {
          setBatchSize(n)
        },
      })
    }

    const offset = $(batchSizeRef.current!).offset()
    contextMenu(
      { clientX: offset.left, clientY: offset.top + offset.height + 5 },
      template
    )
  }

  return (
    <div className={Style.generate}>
      <div
        className={className(Style.generateButton, 'button', 'primary')}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => store.createGenTask()}
      >
        {t('generate')}
      </div>
      <div className={Style.spinButtons}>
        <div
          className={className(Style.spinUpButton, 'button', 'primary')}
          onClick={() => setBatchSize(genOptions.batchSize + 1)}
        >
          <span className="icon-arrow-up"></span>
        </div>
        <div
          className={className(Style.spinDownButton, 'button', 'primary')}
          onClick={() => setBatchSize(genOptions.batchSize - 1)}
        >
          <span className="icon-arrow-down"></span>
        </div>
      </div>
      <div
        className={className(Style.batchSizeButton, 'button', 'primary')}
        title={t('batchSize')}
        onClick={onBatchSizeClick}
        ref={batchSizeRef}
      >
        {genOptions.batchSize}
      </div>
    </div>
  )
})
