import LunaToolbar from 'luna-toolbar/react'
import { observer } from 'mobx-react-lite'
import Style from './Toolbar.module.scss'
import ToolbarIcon from '../../components/ToolbarIcon'
import { t } from '../../lib/util'

export default observer(function Toolbar() {
  return (
    <LunaToolbar className={Style.toolbar}>
      <ToolbarIcon icon="add" title={t('addDownloadTask')} onClick={() => {}} />
    </LunaToolbar>
  )
})
