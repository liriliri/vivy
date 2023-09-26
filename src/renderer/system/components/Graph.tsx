import LunaPerformanceMonitor from 'luna-performance-monitor/react'
import { useCallback, useEffect, useRef } from 'react'
import store from '../store'
import { observer } from 'mobx-react-lite'
import { colorPrimary, colorPrimaryDark } from '../../../common/theme'

export default observer(function Graph() {
  const cpuAndMemRef = useRef({
    cpu: 0,
    mem: 0,
  })

  const cpuData = useCallback(() => {
    return +cpuAndMemRef.current.cpu.toFixed(2)
  }, [])

  const memData = useCallback(() => {
    return +(cpuAndMemRef.current.mem / 1024 / 1024).toFixed(1)
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timer | null = null

    async function updateCpuAndMem() {
      timer = null
      cpuAndMemRef.current = await main.getCpuAndMem()
      timer = setTimeout(updateCpuAndMem, 2000)
    }

    updateCpuAndMem()

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [])

  const { theme } = store.settings
  const color = theme === 'dark' ? colorPrimaryDark : colorPrimary

  return (
    <>
      <LunaPerformanceMonitor
        title="CPU"
        data={cpuData}
        theme={theme}
        color={color}
        unit="%"
      />
      <LunaPerformanceMonitor
        title="MEM"
        data={memData}
        theme={theme}
        color={color}
        unit="MB"
      />
    </>
  )
})
