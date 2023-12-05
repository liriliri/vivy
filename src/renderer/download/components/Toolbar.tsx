import LunaToolbar from 'luna-toolbar/react'
import { observer } from 'mobx-react-lite'
import Style from './Toolbar.module.scss'
import ToolbarIcon from '../../components/ToolbarIcon'
import { t } from '../../lib/util'
import AddDownloadModal from './AddDownloadModal'
import { useState } from 'react'

export default observer(function Toolbar() {
  const [addDownloadModalVisible, setAddDownloadModalVisible] = useState(false)

  return (
    <>
      <LunaToolbar className={Style.toolbar}>
        <ToolbarIcon
          icon="add"
          title={t('addDownloadTask')}
          onClick={() => {
            setAddDownloadModalVisible(true)
          }}
        />
      </LunaToolbar>
      <AddDownloadModal
        visible={addDownloadModalVisible}
        onClose={() => setAddDownloadModalVisible(false)}
      />
    </>
  )
})
