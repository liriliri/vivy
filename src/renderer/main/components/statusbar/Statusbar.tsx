import Style from './Statusbar.module.scss'
import { observer } from 'mobx-react-lite'
import className from 'licia/className'
import { invokeMain } from '../../../lib/util'

export default observer(function () {
  return (
    <div className={Style.statusbar}>
      <div
        className={className(Style.item, Style.button)}
        onClick={() => invokeMain('showTerminal')}
      >
        <span className="icon-terminal"></span>
      </div>
    </div>
  )
})
