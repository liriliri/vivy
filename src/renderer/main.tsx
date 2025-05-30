import ReactDOM from 'react-dom/client'
import { lazy } from 'react'
import { i18n, t } from '../common/util'
import { isDev } from 'share/common/util'
import hotKey from 'licia/hotkey'
import getUrlParam from 'licia/getUrlParam'
import './main.scss'
import 'share/renderer/main.scss'
import './icon.css'
import 'luna-setting/css'
import 'luna-toolbar/css'
import 'luna-image-viewer/css'
import 'luna-data-grid/css'
import 'luna-modal/css'
import 'luna-performance-monitor/css'
import 'luna-notification/css'
import 'luna-tab/css'
import 'luna-menu/css'
import 'luna-painter/css'
import 'luna-cropper/css'
import 'luna-object-viewer/css'
import './luna.scss'
import { spy } from 'mobx'
import LunaModal from 'luna-modal'
import LunaPainter from 'luna-painter'
import isMac from 'licia/isMac'

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
      App = lazy(() => import('share/renderer/terminal/App.js') as Promise<any>)
      title = t('terminal')
      break
    case 'system':
      App = lazy(() => import('./system/App.js') as Promise<any>)
      title = t('sysInfo')
      break
    case 'download':
      App = lazy(() => import('./download/App.js') as Promise<any>)
      title = t('downloadManager')
      break
    case 'painter':
      App = lazy(() => import('./painter/App.js') as Promise<any>)
      title = t(getUrlParam('mode') as string)
      break
    case 'webui':
      App = lazy(() => import('./webui/App.js') as Promise<any>)
      title = 'Stable Diffusion web UI'
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
  const language = await main.getLanguage()
  i18n.locale(language)
  LunaModal.i18n.locale(language)
  LunaPainter.i18n.locale(language)

  document.body.classList.add(`platform-${isMac ? 'mac' : 'windows'}`)

  renderApp()
})()
