import Style from './Statusbar.module.scss'
import { observer } from 'mobx-react-lite'
import className from 'licia/className'
import store from '../../store'

export default observer(function () {
  let imageInfo: JSX.Element | null = null

  if (store.selectedImage) {
    const { info } = store.selectedImage
    imageInfo = (
      <div className={Style.item}>
        {info.width} × {info.height}
      </div>
    )
  }

  return (
    <div className={Style.statusbar}>
      <div
        className={className(Style.item, Style.button)}
        onClick={() => main.showTerminal()}
      >
        <span className="icon-terminal"></span>
      </div>
      {imageInfo}
    </div>
  )
})
