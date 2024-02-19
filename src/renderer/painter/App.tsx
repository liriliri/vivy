import Painter from './components/Painter'
import Style from './App.module.scss'

export default function App() {
  return (
    <div className={Style.container}>
      <Painter />
    </div>
  )
}
