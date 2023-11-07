import ReactDOM from 'react-dom/client'
import { lazy } from 'react'
import { getSystemLanguage, i18n, isDev, t } from './lib/util'
import hotKey from 'licia/hotkey'
import getUrlParam from 'licia/getUrlParam'
import './main.scss'
import './icon.css'
import 'luna-setting/css'
import 'luna-toolbar/css'
import 'luna-image-viewer/css'
import 'luna-data-grid/css'
import 'luna-modal/css'
import 'luna-performance-monitor/css'
import 'luna-notification/css'
import 'luna-tab/css'
import './luna.scss'
import { spy } from 'mobx'
import LunaModal from 'luna-modal'

function renderApp() {
  const container: HTMLElement = document.getElementById('app') as HTMLElement

  let App = lazy(() => import('./main/App.js') as Promise<any>)
  let title = 'VIVY'
  switch (getUrlParam('page')) {
    case 'prompt':
      App = lazy(() => import('./prompt/App.js') as Promise<any>)
      title = t('promptBuilder')
      break
    case 'model':
      App = lazy(() => import('./model/App.js') as Promise<any>)
      title = t('modelManager')
      break
    case 'terminal':
      App = lazy(() => import('./terminal/App.js') as Promise<any>)
      title = t('terminal')
      break
    case 'system':
      App = lazy(() => import('./system/App.js') as Promise<any>)
      title = t('sysInfo')
      break
  }
  preload.setTitle(title)

  ReactDOM.createRoot(container).render(<App />)
}

if (isDev()) {
  hotKey.on('f5', () => location.reload())
  spy((event) => {
    switch (event.type) {
      case 'action':
        // console.log('mobx action', event.name, ...event.arguments)
        break
      case 'add':
        // console.log('mobx add', event.debugObjectName)
        break
      case 'update':
        // console.log('mobx update', event.debugObjectName)
        break
    }
  })
}

;(async function () {
  let language = await main.getSettingsStore('language')
  if (!language) {
    language = getSystemLanguage()
    await main.setSettingsStore('language', language)
  }
  i18n.locale(language)
  LunaModal.i18n.locale(language)
  renderApp()
})()
