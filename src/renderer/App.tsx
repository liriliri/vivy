import Sidebar from './components/sidebar/Sidebar'
import Gallery from './components/gallery/Gallery'
import Toolbar from './components/toolbar/Toolbar'
import Statusbar from './components/statusbar/Statusbar'
import './App.scss'
import 'luna-setting/luna-setting.css'
import 'luna-toolbar/luna-toolbar.css'
import './luna.scss'

export default function App() {
  return (
    <>
      <Toolbar />
      <Sidebar />
      <Gallery />
      <Statusbar />
    </>
  )
}
