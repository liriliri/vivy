import { observer } from 'mobx-react-lite'
import Style from './DownloadList.module.scss'
import map from 'licia/map'
import isEmpty from 'licia/isEmpty'
import fileSize from 'licia/fileSize'
import className from 'licia/className'
import store from '../store'
import { t } from '../../../common/util'
import LunaModal from 'luna-modal'
import copy from 'licia/copy'
import contextMenu from 'share/renderer/lib/contextMenu'

export default observer(function DownloadList() {
  const downloads = map(store.downloads, (download) => {
    const progress = Math.round(
      (download.receivedBytes / download.totalBytes) * 100
    )
    const isProgressing = download.state === 'progressing'
    const isInterrupted = download.state === 'interrupted'

    const onContextMenu = (e: React.MouseEvent) => {
      const template: any[] = [
        {
          label: t('copyDownloadUrl'),
          click: () => copy(download.url),
        },
        {
          label: t('copySavePath'),
          click: () => copy(download.path),
        },
      ]

      contextMenu(e, template)
    }

    return (
      <div
        className={className(Style.item, {
          [Style.interrupted]: isInterrupted,
        })}
        onContextMenu={onContextMenu}
        key={download.id}
      >
        {isProgressing && (
          <div
            className={Style.progress}
            style={{
              width: `${progress}%`,
            }}
          />
        )}
        <div className={Style.body}>
          <div className={Style.info}>
            <div className={Style.name}>{download.fileName}</div>
            <div className={Style.size}>
              {isProgressing && `${fileSize(download.receivedBytes)}B/`}
              {fileSize(download.totalBytes)}B
            </div>
          </div>
          {isProgressing && (
            <div className={Style.speed}>{fileSize(download.speed)}B/s</div>
          )}
          <div className={Style.controls}>
            {isProgressing && (
              <div
                className={Style.control}
                onClick={() => {
                  const { id } = download
                  if (download.paused) {
                    main.resumeDownload(id)
                  } else {
                    main.pauseDownload(id)
                  }
                }}
              >
                <span
                  className={download.paused ? 'icon-play' : 'icon-pause'}
                ></span>
              </div>
            )}
            {isInterrupted && (
              <div
                className={Style.control}
                onClick={async () => {
                  const { url, fileName, type, id } = download
                  await main.deleteDownload(id)
                  await main.downloadModel({
                    url,
                    fileName,
                    type,
                  })
                }}
              >
                <span className="icon-refresh"></span>
              </div>
            )}
            {download.state === 'completed' && (
              <div
                className={Style.control}
                onClick={() => {
                  main.openFileInFolder(download.path)
                }}
              >
                <span className="icon-open-file"></span>
              </div>
            )}
            <div
              className={Style.control}
              onClick={async () => {
                if (isProgressing) {
                  const result = await LunaModal.confirm(
                    t('cancelDownloadConfirm', { name: download.fileName })
                  )
                  if (!result) {
                    return
                  }
                }
                main.deleteDownload(download.id)
              }}
            >
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
