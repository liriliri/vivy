import Style from './App.module.scss'
import Sketch from './components/Sketch'
import Mask from './components/Mask'
import getUrlParam from 'licia/getUrlParam'

export default function App() {
  const mode = getUrlParam('mode')

  return (
    <div className={Style.container}>
      {mode === 'sketch' ? <Sketch /> : <Mask />}
    </div>
  )
}
