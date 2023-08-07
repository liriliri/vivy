import ReactDOM from 'react-dom/client'
import { lazy } from 'react'
import { isDev } from './lib/util'
import hotKey from 'licia/hotkey'
import isDarkMode from 'licia/isDarkMode'
import getUrlParam from 'licia/getUrlParam'
import './main.scss'
import './icon.css'
import 'luna-setting/css'
import 'luna-toolbar/css'
import 'luna-image-viewer/css'
import 'luna-data-grid/css'
import 'luna-modal/css'
import './luna.scss'

const container: HTMLElement = document.getElementById('app') as HTMLElement

let App = lazy(() => import('./main/App.js') as Promise<any>)
switch (getUrlParam('page')) {
  case 'prompt':
    App = lazy(() => import('./prompt/App.js') as Promise<any>)
    document.title = 'Prompt Builder'
    break
  case 'model':
    App = lazy(() => import('./model/App.js') as Promise<any>)
    document.title = 'Model Manager'
    break
  case 'logger':
    App = lazy(() => import('./logger/App.js') as Promise<any>)
    document.title = 'Logger'
    break
}

ReactDOM.createRoot(container).render(<App />)

if (isDev()) {
  hotKey.on('f5', () => location.reload())
}

if (isDarkMode()) {
  document.body.classList.add('-theme-with-dark-background')
}
