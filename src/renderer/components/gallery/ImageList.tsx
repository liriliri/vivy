import { observer } from 'mobx-react-lite'
import each from 'licia/each'
import store from '../../store'
import './ImageList.scss'

export default observer(function () {
  const images: JSX.Element[] = []
  each(store.tasks, (task) => {
    each(task.images, (image) => {
      if (image.data) {
        images.push(
          <div
            className="image-item"
            key={image.id}
            onClick={() => store.selectImage(image)}
          >
            <img src={`data:image/png;base64,${image.data}`} />
          </div>
        )
      } else {
        images.push(
          <div className="image-item" key={image.id}>
            {task.progress}%
          </div>
        )
      }
    })
  })

  return <div id="image-list">{images}</div>
})
