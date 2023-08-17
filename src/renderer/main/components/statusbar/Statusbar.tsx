import Style from './Statusbar.module.scss'
import { observer } from 'mobx-react-lite'
import className from 'licia/className'

export default observer(function () {
  return (
    <div className={Style.statusbar}>
      <div
        className={className(Style.item, Style.button)}
        onClick={() => main.showTerminal()}
      >
        <span className="icon-terminal"></span>
      </div>
    </div>
  )
})
