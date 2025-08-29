import ImageViewer from './ImageViewer'
import ImageList from './ImageList'
import Style from './Gallery.module.scss'
import LunaSplitPane, { LunaSplitPaneItem } from 'luna-split-pane/react'
import store from '../../store'

export default function () {
  return (
    <div className={Style.gallery}>
      <LunaSplitPane
        direction="vertical"
        onResize={(weights) => {
          const [imageViewerWeight, imageListWeight] = weights
          store.ui.set(
            'imageListWeight',
            Math.round(
              (imageListWeight / (imageViewerWeight + imageListWeight)) * 100
            )
          )
        }}
      >
        <LunaSplitPaneItem
          minSize={200}
          weight={100 - store.ui.imageListWeight}
        >
          <ImageViewer />
        </LunaSplitPaneItem>
        <LunaSplitPaneItem minSize={181} weight={store.ui.imageListWeight}>
          <ImageList />
        </LunaSplitPaneItem>
      </LunaSplitPane>
    </div>
  )
}
