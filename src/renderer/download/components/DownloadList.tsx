import { observer } from 'mobx-react-lite'
import Style from './DownloadList.module.scss'
import map from 'licia/map'
import isEmpty from 'licia/isEmpty'
import fileSize from 'licia/fileSize'
import store from '../store'
import { t } from '../../lib/util'

export default observer(function DownloadList() {
  const downloads = map(store.downloads, (download) => {
    return (
      <div className={Style.item} id={download.id}>
        <div className={Style.progress} />
        <div className={Style.body}>
          <div className={Style.info}>
            <div className={Style.name}>{download.fileName}</div>
            <div className={Style.size}>
              {fileSize(download.receivedBytes)}B/
              {fileSize(download.totalBytes)}B
            </div>
          </div>
          <div className={Style.speed}>{fileSize(download.speed)}B/s</div>
          <div className={Style.controls}>
            <div className={Style.control}>
              <span className="icon-pause"></span>
            </div>
            <div className={Style.control}>
              <span className="icon-delete"></span>
            </div>
          </div>
        </div>
      </div>
    )
  })

  return (
    <div className={Style.downloadList}>
      {isEmpty(downloads) ? (
        <div className={Style.noDownloads}>{t('noDownloads')}</div>
      ) : (
        downloads
      )}
    </div>
  )
})
