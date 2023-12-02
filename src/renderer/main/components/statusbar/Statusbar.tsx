import Style from './Statusbar.module.scss'
import { observer } from 'mobx-react-lite'
import className from 'licia/className'
import fileSize from 'licia/fileSize'
import truncate from 'licia/truncate'
import store from '../../store'
import { useEffect, useState } from 'react'
import ProgressBar from './ProgressBar'
import { t } from '../../../lib/util'

export default observer(function () {
  const [cpuUsage, setCpuUsage] = useState(0)
  const [memUsage, setMemUsage] = useState(0)

  useEffect(() => {
    let timer: NodeJS.Timer | null = null

    async function updateCpuAndMem() {
      timer = null
      const { cpu, mem } = await main.getCpuAndMem()
      setCpuUsage(cpu)
      setMemUsage(mem)
      timer = setTimeout(updateCpuAndMem, 2000)
    }

    updateCpuAndMem()

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [])

  let imageInfo: JSX.Element | null = null
  if (store.selectedImage) {
    const { info } = store.selectedImage
    imageInfo = (
      <div className={Style.item}>
        {info.width} × {info.height} {fileSize(info.size)}B{' '}
        {info.prompt ? truncate(info.prompt, 100) : ''}
      </div>
    )
  }

  let taskCount: JSX.Element | null = null
  if (store.tasks.length > 0) {
    taskCount = (
      <div className={Style.item}>
        {t('task')}: {store.tasks.length}
      </div>
    )
  }

  let imageCount: JSX.Element | null = null
  if (store.images.length > 0) {
    imageCount = (
      <div className={Style.item}>
        {t('image')}: {store.images.length}
      </div>
    )
  }

  return (
    <div className={Style.statusbar}>
      <div
        className={className(Style.item, Style.button)}
        title={t('terminal')}
        onClick={() => main.showTerminal()}
      >
        <span className="icon-terminal"></span>
      </div>
      <div
        className={className(Style.item, Style.button)}
        title={t('downloadManager')}
        onClick={() => main.showDownload()}
      >
        <span className="icon-download"></span>
      </div>
      {imageInfo}
      <div className={Style.space}></div>
      {taskCount}
      {imageCount}
      <div
        className={className(Style.item, Style.systemInfo, Style.button)}
        onClick={() => main.showSystem()}
      >
        <div className={Style.cpu}>CPU {cpuUsage.toFixed(2)}</div>
        <div className={Style.mem}>MEM {fileSize(memUsage)}B</div>
      </div>
      <ProgressBar />
    </div>
  )
})
