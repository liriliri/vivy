import ReactDOM from 'react-dom/client'
import { lazy } from 'react'
import { isDev } from './lib/util'
import hotKey from 'licia/hotkey'
import './main.scss'
import './icon.css'
import 'luna-setting/luna-setting.css'
import 'luna-toolbar/luna-toolbar.css'
import 'luna-image-viewer/luna-image-viewer.css'
import 'luna-data-grid/luna-data-grid.css'
import 'luna-modal/css'
import './luna.scss'

const container: HTMLElement = document.getElementById('app') as HTMLElement

let App = lazy(() => import('./main/App'))
switch (location.pathname) {
  case '/prompt':
    App = lazy(() => import('./prompt/App'))
    document.title = 'Prompt Builder'
    break
  case '/model':
    App = lazy(() => import('./model/App'))
    document.title = 'Model Manager'
    break
}

ReactDOM.createRoot(container).render(<App />)

if (isDev()) {
  hotKey.on('f5', () => location.reload())
}
