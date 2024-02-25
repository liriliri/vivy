import LunaMaskEditor from 'luna-mask-editor/react'
import store from '../store'
import { observer } from 'mobx-react-lite'
import debounce from 'licia/debounce'

export default observer(function App() {
  return (
    <LunaMaskEditor
      style={{
        width: '100%',
        height: '100%',
      }}
      image={store.image}
      mask={store.mask}
      onChange={debounce((canvas) => {
        store.setMask(canvas.toDataURL())
      }, 1000)}
    />
  )
})
