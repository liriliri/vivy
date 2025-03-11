import Sidebar from './components/sidebar/Sidebar'
import Gallery from './components/gallery/Gallery'
import Toolbar from './components/toolbar/Toolbar'
import Statusbar from './components/statusbar/Statusbar'
import Style from './App.module.scss'
import LunaModal from 'luna-modal/react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { t } from '../../common/util'
import icon from '../assets/img/icon.png'
import store from './store'
import { autorun } from 'mobx'
import splitPath from 'licia/splitPath'
import ImageInfoModal from './components/common/ImageInfoModal'
import InterrogateModal from './components/common/InterrogateModal'
import PreprocessModal from './components/common/PreprocessModal'
import { observer } from 'mobx-react-lite'

autorun(() => {
  const { path, isSave } = store.project
  let name = t('untitled') + '.vivy'
  if (path) {
    name = splitPath(path).name
  }
  preload.setTitle(name + (isSave ? '' : ' •'))
})

export default observer(function App() {
  const [aboutVisible, setAboutVisible] = useState(false)

  useEffect(() => {
    const showAbout = () => setAboutVisible(true)
    const offShowAbout = main.on('showAbout', showAbout)
    return () => {
      offShowAbout()
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
      {createPortal(
        <LunaModal
          title={t('aboutVivy')}
          visible={aboutVisible}
          width={400}
          onClose={() => setAboutVisible(false)}
        >
          <div className={Style.about}>
            <img className={Style.icon} src={icon} />
            <div>VIVY</div>
            <div>
              {t('version')} {VIVY_VERSION}
            </div>
          </div>
        </LunaModal>,
        document.body
      )}
    </>
  )
})
