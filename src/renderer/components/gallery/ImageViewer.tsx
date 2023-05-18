import { observer } from 'mobx-react-lite'
import store from '../../store'
import './ImageViewer.scss'

export default observer(function () {
  const image = store.selectedImage ? (
    <img src={store.selectedImage.data} />
  ) : null

  return <div id="image-viewer">{image}</div>
})
