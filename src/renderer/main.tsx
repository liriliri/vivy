import ReactDOM from 'react-dom/client'
import { isDev } from './lib/util'
import hotKey from 'licia/hotkey'
import MainApp from './main/App'
import './main.scss'
import './icon.css'
import 'luna-setting/luna-setting.css'
import 'luna-toolbar/luna-toolbar.css'
import 'luna-image-viewer/luna-image-viewer.css'
import './luna.scss'

const container: HTMLElement = document.getElementById('app') as HTMLElement
const app = <MainApp />

ReactDOM.createRoot(container).render(app)

if (isDev()) {
  hotKey.on('f5', () => location.reload())
}
