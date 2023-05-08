import { observer } from 'mobx-react-lite'
import store from '../../store'
import './ImageViewer.scss'

export default observer(function () {
  const image = store.currentImage ? (
    <img src={store.currentImage.data} />
  ) : null

  return <div id="image-viewer">{image}</div>
})
