import ReactDOM from 'react-dom/client'
import { lazy } from 'react'
import { i18n, t } from '../common/util'
import getUrlParam from 'licia/getUrlParam'
import LunaModal from 'luna-modal'
import LunaPainter from 'luna-painter'
import 'share/renderer/main'
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
import 'luna-split-pane/css'
import 'share/renderer/luna.scss'
import './luna.scss'
import 'share/renderer/main.scss'
import './main.scss'
import './icon.css'

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

;(async function () {
  const language = await main.getLanguage()
  i18n.locale(language)
  LunaModal.i18n.locale(language)
  LunaPainter.i18n.locale(language)

  renderApp()
})()
