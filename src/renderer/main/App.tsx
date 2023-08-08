import Sidebar from './components/sidebar/Sidebar'
import Gallery from './components/gallery/Gallery'
import Toolbar from './components/toolbar/Toolbar'
import Statusbar from './components/statusbar/Statusbar'
import Style from './App.module.scss'

export default function App() {
  return (
    <>
      <Toolbar />
      <div className={Style.workspace}>
        <Sidebar />
        <Gallery />
      </div>
      <Statusbar />
    </>
  )
}
