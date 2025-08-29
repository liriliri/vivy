import { observer } from 'mobx-react-lite'
import Style from './Sidebar.module.scss'
import { useRef } from 'react'
import GenOptions from './GenOptions'
import Prompt from './Prompt'
import Generate from './Generate'
import ControlNet from './ControlNet'

export default observer(function () {
  const sidebarRef = useRef<HTMLDivElement>(null)

  return (
    <div className={Style.sidebar} ref={sidebarRef}>
      <div className={Style.generateBasic}>
        <Prompt />
        <Generate />
      </div>
      <div className={Style.generateOptions}>
        <GenOptions />
        <ControlNet />
      </div>
    </div>
  )
})
