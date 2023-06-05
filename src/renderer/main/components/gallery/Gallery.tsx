import ImageViewer from './ImageViewer'
import ImageList from './ImageList'
import './Gallery.scss'

export default function () {
  return (
    <div id="gallery">
      <ImageViewer />
      <ImageList />
    </div>
  )
}
