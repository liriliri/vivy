import Sidebar from './components/sidebar/Sidebar'
import Gallery from './components/gallery/Gallery'
import Toolbar from './components/toolbar/Toolbar'
import './App.scss'

export default function App() {
  return (
    <div id="app">
      <Toolbar />
      <Sidebar />
      <Gallery />
    </div>
  )
}
