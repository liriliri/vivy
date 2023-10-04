import Sidebar from './components/sidebar/Sidebar'
import Gallery from './components/gallery/Gallery'
import Toolbar from './components/toolbar/Toolbar'
import Statusbar from './components/statusbar/Statusbar'
import Style from './App.module.scss'
import LunaModal from 'luna-modal/react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { t } from '../lib/util'
import icon from '../assets/img/icon.png'

export default function App() {
  const [aboutVisible, setAboutVisible] = useState(false)

  useEffect(() => {
    const showAbout = () => setAboutVisible(true)
    main.on('showAbout', showAbout)
    return () => {
      main.off('showAbout', showAbout)
    }
  }, [])

  return (
    <>
      <Toolbar />
      <div className={Style.workspace}>
        <Sidebar />
        <Gallery />
      </div>
      <Statusbar />
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
              {t('version')} v{VERSION}
            </div>
          </div>
        </LunaModal>,
        document.body
      )}
    </>
  )
}
