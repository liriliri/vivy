import Sidebar from './components/sidebar/Sidebar'
import Gallery from './components/gallery/Gallery'
import Toolbar from './components/toolbar/Toolbar'
import Statusbar from './components/statusbar/Statusbar'
import Style from './App.module.scss'
import { useEffect } from 'react'
import { t } from '../../common/util'
import store from './store'
import { autorun } from 'mobx'
import splitPath from 'licia/splitPath'
import ImageInfoModal from './components/common/ImageInfoModal'
import InterrogateModal from './components/common/InterrogateModal'
import PreprocessModal from './components/common/PreprocessModal'
import { observer } from 'mobx-react-lite'
import Modal from 'luna-modal'

autorun(() => {
  const { path, isSave } = store.project
  let name = t('untitled') + '.vivy'
  if (path) {
    name = splitPath(path).name
  }
  preload.setTitle(name + (isSave ? '' : ' •'))
})

export default observer(function App() {
  useEffect(() => {
    const offUpdateError = main.on('updateError', () => {
      Modal.alert(t('updateErr'))
    })
    const offUpdateNotAvailable = main.on('updateNotAvailable', () => {
      Modal.alert(t('updateNotAvailable'))
    })
    const offUpdateAvailable = main.on('updateAvailable', async () => {
      const result = await Modal.confirm(t('updateAvailable'))
      if (result) {
        main.openExternal('https://vivy.liriliri.io')
      }
    })
    return () => {
      offUpdateError()
      offUpdateNotAvailable()
      offUpdateAvailable()
    }
  }, [])

  const { imageInfoModal, interrogateModal, preprocessModal } = store

  return (
    <>
      <Toolbar />
      <div className={Style.workspace}>
        <Sidebar />
        <Gallery />
      </div>
      <Statusbar />
      {imageInfoModal.image && (
        <ImageInfoModal
          visible={imageInfoModal.visible}
          image={imageInfoModal.image}
          onClose={() => imageInfoModal.close()}
        />
      )}
      {interrogateModal.image && (
        <InterrogateModal
          visible={interrogateModal.visible}
          image={interrogateModal.image}
          onClose={() => interrogateModal.close()}
        />
      )}
      {preprocessModal.image && (
        <PreprocessModal
          visible={preprocessModal.visible}
          image={preprocessModal.image}
          onClose={() => preprocessModal.close()}
        />
      )}
    </>
  )
})
