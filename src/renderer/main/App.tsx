import Sidebar from './components/sidebar/Sidebar'
import Gallery from './components/gallery/Gallery'
import Toolbar from './components/toolbar/Toolbar'
import Statusbar from './components/statusbar/Statusbar'

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
