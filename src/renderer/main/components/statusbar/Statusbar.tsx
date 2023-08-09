import Style from './Statusbar.module.scss'
import { observer } from 'mobx-react-lite'
import store from '../../store'
import className from 'licia/className'
import loading from '../../../assets/img/loading.svg'
import { invokeMain } from '../../../lib/util'

export default observer(function () {
  const status = store.isReady ? (
    <span className={Style.ready} />
  ) : (
    <img className={Style.loading} src={loading} />
  )

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
