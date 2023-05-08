import './Statusbar.scss'
import { observer } from 'mobx-react-lite'
import store from '../../store'

export default observer(function () {
  const status = `Stable Diffusion is ${store.isReady ? 'ready' : 'loading...'}`

  return <div id="statusbar">{status}</div>
})
