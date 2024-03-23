import Style from './Statusbar.module.scss'
import { observer } from 'mobx-react-lite'
import className from 'licia/className'
import fileSize from 'licia/fileSize'
import truncate from 'licia/truncate'
import store from '../../store'
import { PropsWithChildren, useEffect, useState } from 'react'
import ProgressBar from './ProgressBar'
import { t } from '../../../lib/util'
import now from 'licia/now'

interface IStatusbarDescProps {
  desc: string
  className?: string
}

export function StatusbarDesc(props: PropsWithChildren<IStatusbarDescProps>) {
  return (
    <div
      className={props.className || ''}
      onMouseEnter={() => store.setStatus(props.desc)}
      onMouseLeave={() => store.setStatus('')}
    >
      {props.children}
    </div>
  )
}

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

  let desc: JSX.Element | null = null
  if (store.statusbarDesc || store.project.selectedImage) {
    let text = store.statusbarDesc
    if (!text && store.project.selectedImage) {
      const { info } = store.project.selectedImage
      text = `${info.width} × ${info.height} ${fileSize(info.size)}B ${
        info.prompt || ''
      }`
    }
    desc = <div className={Style.item}>{truncate(text, 150)}</div>
  }

  let taskDuration: JSX.Element | null = null
  if (store.tasks.length > 0) {
    taskDuration = <TaskDuration />
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
  if (store.project.images.length > 0) {
    imageCount = (
      <div className={Style.item}>
        {t('image')}: {store.project.images.length}
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
      {desc}
      <div className={Style.space}></div>
      {taskDuration}
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

function TaskDuration() {
  const startTime = now()
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const duration = Math.round((now() - startTime) / 1000)
      setDuration(duration)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={className(Style.item, Style.taskDuration)}>
      {t('time')}: {duration}
    </div>
  )
}
