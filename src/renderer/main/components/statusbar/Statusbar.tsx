import Style from './Statusbar.module.scss'
import { observer } from 'mobx-react-lite'
import className from 'licia/className'
import fileSize from 'licia/fileSize'
import store from '../../store'
import { useEffect, useState } from 'react'
import ProgressBar from './ProgressBar'

export default observer(function () {
  const [cpuLoad, setCpuLoad] = useState(0)
  const [memLoad, setMemLoad] = useState(0)

  useEffect(() => {
    let timer: NodeJS.Timer | null = null

    async function updateLoad() {
      timer = null
      setCpuLoad(Math.round(await main.getCpuLoad()))
      setMemLoad(Math.round(await main.getMemLoad()))
      timer = setTimeout(updateLoad, 2000)
    }

    updateLoad()

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
        {info.width} × {info.height} {fileSize(info.size)}B
      </div>
    )
  }

  let imageCount: JSX.Element | null = null
  if (store.images.length > 0) {
    imageCount = <div className={Style.item}>{store.images.length}</div>
  }

  return (
    <div className={Style.statusbar}>
      <div
        className={className(Style.item, Style.button)}
        onClick={() => main.showTerminal()}
      >
        <span className="icon-terminal"></span>
      </div>
      {imageInfo}
      <div className={Style.space}></div>
      {imageCount}
      <div className={className(Style.item, Style.systemInfo)}>
        <div className={Style.cpu}>CPU {cpuLoad}</div>
        <div className={Style.mem}>MEM {memLoad}</div>
      </div>
      <ProgressBar />
    </div>
  )
})
