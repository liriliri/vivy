import { observer } from 'mobx-react-lite'
import { LoadingBar } from '../components/loading'
import Style from './App.module.scss'
import store from './store'
import { t } from '../../common/util'
import { useState } from 'react'

export default observer(function App() {
  const [iframeVisible, setIframeVisible] = useState(false)

  let loading: JSX.Element | null = null
  if (!store.isWebUIErr && !iframeVisible) {
    loading = (
      <LoadingBar
        className={Style.loading}
        onClick={() => {
          main.showTerminal()
        }}
      />
    )
  }

  const err = store.isWebUIErr ? t('webUIErr') : null

  let iframe: JSX.Element | null = null
  if (store.isWebUIReady && !store.isWebUIErr) {
    iframe = (
      <iframe
        src={store.webUIUrl}
        style={{
          visibility: iframeVisible ? 'visible' : 'hidden',
        }}
        className={Style.iframe}
      ></iframe>
    )

    setTimeout(() => {
      setIframeVisible(true)
    }, 1500)
  }

  return (
    <div className={Style.container}>
      {loading}
      {err}
      {iframe}
    </div>
  )
})
