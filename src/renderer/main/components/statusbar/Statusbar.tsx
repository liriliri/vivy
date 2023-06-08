import Style from './Statusbar.module.scss'
import { observer } from 'mobx-react-lite'
import store from '../../store'

export default observer(function () {
  const status = `Stable Diffusion is ${store.isReady ? 'ready' : 'loading...'}`

  return <div className={Style.statusbar}>{status}</div>
})
