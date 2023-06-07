import LunaToolbar from 'luna-toolbar'
import { useEffect, useRef } from 'react'
import './Toolbar.scss'

export default function Toolbar() {
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const toolbar = new LunaToolbar(toolbarRef.current as HTMLDivElement)
    toolbar.appendSelect('type', 'Stable-diffusion', {
      'Stable Diffusion': 'Stable-diffusion',
    })
    return () => toolbar.destroy()
  }, [])

  return <div id="toolbar" ref={toolbarRef}></div>
}
