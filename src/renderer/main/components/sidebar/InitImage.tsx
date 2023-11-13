import { observer } from 'mobx-react-lite'
import Style from './InitImage.module.scss'
import openFile from 'licia/openFile'
import store from '../../store'
import convertBin from 'licia/convertBin'
import { toDataUrl } from '../../../lib/util'
import LunaImageViewer from 'luna-image-viewer/react'

export default observer(function InitImage() {
  const onClick = () => {
    openFile({
      accept: 'image/png',
    }).then(async (fileList) => {
      const file = fileList[0]
      if (file) {
        const buf = await convertBin.blobToArrBuffer(file)
        const data = await convertBin(buf, 'base64')
        store.setInitImage(data)
      }
    })
  }

  if (!store.initImage) {
    return (
      <div className={Style.initImage} onClick={onClick}>
        点击上传参考图
      </div>
    )
  } else {
    return (
      <LunaImageViewer
        className={Style.imageViewer}
        image={toDataUrl(store.initImage.data, 'image/png')}
      ></LunaImageViewer>
    )
  }
})
