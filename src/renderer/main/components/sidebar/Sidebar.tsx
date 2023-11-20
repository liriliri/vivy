import { observer } from 'mobx-react-lite'
import store from '../../store'
import Style from './Sidebar.module.scss'
import { useCallback, useRef, useState } from 'react'
import GenOptions from './GenOptions'
import Prompt from './Prompt'

export default observer(function () {
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [resizerStyle, setResizerStyle] = useState<any>({
    width: '10px',
  })

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
      store.ui.set('sidebarWidth', width - deltaX)
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
      style={{
        width: store.ui.sidebarWidth,
        display: store.ui.sidebarCollapsed ? 'none' : 'flex',
      }}
    >
      <div
        className={Style.resizer}
        style={resizerStyle}
        onMouseDown={onMouseDown}
      ></div>
      <Prompt />
      <GenOptions />
    </div>
  )
})
