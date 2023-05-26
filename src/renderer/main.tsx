import ReactDOM from 'react-dom/client'
import App from './App'
import { isDev } from './lib/util'
import hotKey from 'licia/hotkey'
import './index.scss'

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <App />
)

if (isDev()) {
  hotKey.on('f5', () => location.reload())
}
