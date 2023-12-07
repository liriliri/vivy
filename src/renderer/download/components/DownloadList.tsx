import { observer } from 'mobx-react-lite'
import Style from './DownloadList.module.scss'
import map from 'licia/map'
import isEmpty from 'licia/isEmpty'
import fileSize from 'licia/fileSize'
import store from '../store'
import { t } from '../../lib/util'

export default observer(function DownloadList() {
  const downloads = map(store.downloads, (download) => {
    const progress = Math.round(
      (download.receivedBytes / download.totalBytes) * 100
    )

    return (
      <div className={Style.item} key={download.id}>
        <div
          className={Style.progress}
          style={{
            width: `${progress}%`,
          }}
        />
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
            {download.state === 'progressing' && (
              <div
                className={Style.control}
                onClick={() => {
                  download.paused
                    ? main.resumeDownload(download.id)
                    : main.pauseDownload(download.id)
                }}
              >
                <span
                  className={download.paused ? 'icon-play' : 'icon-pause'}
                ></span>
              </div>
            )}
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
