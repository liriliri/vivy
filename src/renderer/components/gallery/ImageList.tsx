import { observer } from 'mobx-react-lite'
import map from 'licia/map'
import store from '../../store'
import './ImageList.scss'

export default observer(function () {
  /* const images = map(store.tasks, (task) => {
    if (image.data) {
      return (
        <div
          className="image-item"
          key={image.id}
          onClick={() => store.selectImage(image)}
        >
          <img src={image.data} />
        </div>
      )
    } else {
      return (
        <div className="image-item" key={image.id}>
          {image.progress}%
        </div>
      )
    }
  }) */

  return <div id="image-list"></div>
})
