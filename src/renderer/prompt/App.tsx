import Prompt from './components/Prompt'
import TagSelector from './components/TagSelector'
import Style from './App.module.scss'

export default function App() {
  return (
    <div className={Style.container}>
      <Prompt />
      <TagSelector />
    </div>
  )
}
