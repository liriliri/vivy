import ImageViewer from './ImageViewer'
import ImageList from './ImageList'
import Style from './Gallery.module.scss'

export default function () {
  return (
    <div className={Style.gallery}>
      <ImageViewer />
      <ImageList />
    </div>
  )
}
