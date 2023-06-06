import ReactDOM from 'react-dom/client'
import { isDev } from './lib/util'
import hotKey from 'licia/hotkey'
import MainApp from './main/App'
import PromptApp from './prompt/App'
import ModelApp from './model/App'
import './main.scss'
import './icon.css'
import 'luna-setting/luna-setting.css'
import 'luna-toolbar/luna-toolbar.css'
import 'luna-image-viewer/luna-image-viewer.css'
import './luna.scss'

const container: HTMLElement = document.getElementById('app') as HTMLElement

let app = <MainApp />
switch (location.pathname) {
  case '/prompt':
    app = <PromptApp />
    document.title = 'Prompt Builder'
    break
  case '/model':
    app = <ModelApp />
    document.title = 'Model Manager'
    break
}

ReactDOM.createRoot(container).render(app)

if (isDev()) {
  hotKey.on('f5', () => location.reload())
}
