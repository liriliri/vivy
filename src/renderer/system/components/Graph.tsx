import LunaPerformanceMonitor from 'luna-performance-monitor/react'
import { useCallback, useEffect, useRef } from 'react'
import store from '../store'
import { observer } from 'mobx-react-lite'
import { t } from '../../lib/util'
import * as webui from '../../lib/webui'
import { colorPrimary, colorPrimaryDark } from '../../../common/theme'
import startWith from 'licia/startWith'

export default observer(function Graph() {
  const dataRef = useRef({
    cpu: 0,
    ram: 0,
    vram: 0,
  })

  const cpuData = useCallback(() => {
    return +dataRef.current.cpu.toFixed(2)
  }, [])

  const ramData = useCallback(() => {
    return +(dataRef.current.ram / 1024 / 1024).toFixed(1)
  }, [])

  const vramData = useCallback(() => {
    return +(dataRef.current.vram / 1024 / 1024 / 1024).toFixed(1)
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timer | null = null

    async function updateCpuAndRam() {
      timer = null
      const { cpu, ram } = await main.getCpuAndRam()
      dataRef.current.cpu = cpu
      dataRef.current.ram = ram
      const isCuda = startWith(store.settings.device, 'cuda')
      if (isCuda) {
        try {
          const { cuda } = await webui.getMemory()
          dataRef.current.vram = cuda.system.used
        } catch (e) {
          // @ts-ignore
        }
      }
      timer = setTimeout(updateCpuAndRam, 2000)
    }

    updateCpuAndRam()

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [])

  const color = store.theme === 'dark' ? colorPrimaryDark : colorPrimary

  const isCuda = startWith(store.settings.device, 'cuda')
  const vram = isCuda ? (
    <LunaPerformanceMonitor
      title={t('vram')}
      data={vramData}
      theme={store.theme}
      color={color}
      unit="GB"
    />
  ) : null

  return (
    <>
      <LunaPerformanceMonitor
        title="CPU"
        data={cpuData}
        theme={store.theme}
        color={color}
        unit="%"
      />
      <LunaPerformanceMonitor
        title={t('ram')}
        data={ramData}
        theme={store.theme}
        color={color}
        unit="MB"
      />
      {vram}
    </>
  )
})
