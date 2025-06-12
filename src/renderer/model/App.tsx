import Toolbar from './components/Toolbar'
import ModelList from './components/ModelList'
import ModelPreview from './components/ModelPreview'
import LunaSplitPane, { LunaSplitPaneItem } from 'luna-split-pane/react'
import Style from './App.module.scss'
import store from './store'

export default function App() {
  return (
    <>
      <Toolbar />
      <LunaSplitPane
        direction="vertical"
        className={Style.splitPane}
        onResize={(weights) => {
          const [modelListWeight, previewWeight] = weights
          store.setPreviewWeight(
            Math.round(
              (previewWeight / (modelListWeight + previewWeight)) * 100
            )
          )
        }}
      >
        <LunaSplitPaneItem minSize={200} weight={100 - store.previewWeight}>
          <ModelList />
        </LunaSplitPaneItem>
        <LunaSplitPaneItem minSize={200} weight={store.previewWeight}>
          <ModelPreview />
        </LunaSplitPaneItem>
      </LunaSplitPane>
    </>
  )
}
