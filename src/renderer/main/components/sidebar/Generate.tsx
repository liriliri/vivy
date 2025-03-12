import className from 'licia/className'
import Style from './Generate.module.scss'
import store from '../../store'
import { t } from '../../../../common/util'
import { observer } from 'mobx-react-lite'
import clamp from 'licia/clamp'
import toStr from 'licia/toStr'
import $ from 'licia/$'
import contextMenu from 'share/renderer/lib/contextMenu'
import { useRef } from 'react'
import times from 'licia/times'
import {
  IModelParam,
  checkControlNetModel,
  checkPreprocessModel,
  downloadModels,
} from '../../lib/model'
import isMac from 'licia/isMac'

export default observer(function Generate() {
  const batchSizeRef = useRef<HTMLDivElement>(null)
  const { project } = store
  const { genOptions } = project

  const createTask = async () => {
    const { controlNetUnits } = project
    const models: Array<IModelParam[]> = []
    for (let i = 0, len = controlNetUnits.length; i < len; i++) {
      const unit = controlNetUnits[i]
      if (unit.image) {
        models.push(checkControlNetModel(unit.type))
        models.push(checkPreprocessModel(unit.preprocessor))
      }
    }
    if (!(await downloadModels(...models))) {
      return
    }

    store.createGenTask()
  }

  const onGenerateContextMenu = function (e: React.MouseEvent) {
    const template: any[] = []
    for (let i = 1; i < 11; i++) {
      const n = i * 10
      template.push({
        label: toStr(n),
        click: () => times(n, createTask),
      })
    }

    contextMenu(e, template)
  }

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
      {
        clientX: offset.left,
        clientY: offset.top + offset.height + (isMac ? 5 : 0),
      },
      template
    )
  }

  return (
    <div className={Style.generate}>
      <div
        className={className(Style.generateButton, 'button', 'primary')}
        onMouseDown={(e) => e.preventDefault()}
        onClick={createTask}
        onContextMenu={onGenerateContextMenu}
      >
        {t('generate')}
      </div>
      <div className={Style.spinButtons}>
        <div
          className={className(Style.spinUpButton, 'button', 'primary')}
          onClick={() => setBatchSize(genOptions.batchSize + 1)}
        >
          <span className="icon-up"></span>
        </div>
        <div
          className={className(Style.spinDownButton, 'button', 'primary')}
          onClick={() => setBatchSize(genOptions.batchSize - 1)}
        >
          <span className="icon-down"></span>
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
