import LunaMaskEditor from 'luna-mask-editor/react'
import Style from './App.module.scss'
import store from './store'
import { observer } from 'mobx-react-lite'
import debounce from 'licia/debounce'

export default observer(function App() {
  return (
    <div className={Style.container}>
      <LunaMaskEditor
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        image={store.image}
        onChange={debounce(async (canvas) => {
          const dataUrl = canvas.toDataURL('image')
          const data = dataUrl.slice(dataUrl.indexOf('base64,') + 7)
          await main.setMainStore('initImageMask', data)
        }, 1000)}
      />
    </div>
  )
})
