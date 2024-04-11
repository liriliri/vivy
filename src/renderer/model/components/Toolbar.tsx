import LunaToolbar, {
  LunaToolbarInput,
  LunaToolbarSelect,
  LunaToolbarSeparator,
  LunaToolbarSpace,
} from 'luna-toolbar/react'
import Style from './Toolbar.module.scss'
import store from '../store'
import { modelTypes } from '../../../common/types'
import { t } from '../../lib/util'
import ToolbarIcon from '../../components/ToolbarIcon'
import toBool from 'licia/toBool'
import { observer } from 'mobx-react-lite'
import LunaModal from 'luna-modal'
import isEmpty from 'licia/isEmpty'
import MetadataModal from './MetadataModal'
import { useState } from 'react'

export default observer(function Toolbar() {
  const [metadataModalVisible, setMetadataModalVisible] = useState(false)

  const onChange = (key, val) => {
    if (key === 'type') {
      store.selectType(val)
    }
  }

  const addModel = async () => {
    const { filePaths } = await main.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'model file', extensions: ['safetensors', 'ckpt', 'pt'] },
      ],
    })
    if (isEmpty(filePaths)) {
      return
    }
    await main.addModel(store.selectedType, filePaths[0])
  }

  const deleteModel = async () => {
    if (!store.selectedModel) {
      return
    }
    const result = await LunaModal.confirm(
      t('deleteModelConfirm', { name: store.selectedModel.name })
    )
    if (result) {
      await main.deleteModel(store.selectedType, store.selectedModel.name)
    }
  }

  return (
    <>
      <LunaToolbar className={Style.toolbar} onChange={onChange}>
        <LunaToolbarSelect
          keyName="type"
          value={store.selectedType}
          options={modelTypes}
        />
        <ToolbarIcon
          icon="open-file"
          title={t('openDir')}
          onClick={() => {
            if (store.selectedModel) {
              main.openFileInFolder(store.selectedModel.path)
            } else {
              main.openModelDir(store.selectedType)
            }
          }}
        />
        <LunaToolbarSeparator />
        <LunaToolbarInput
          keyName="filter"
          value={store.filter}
          placeholder={t('filter')}
          onChange={(val) => store.setFilter(val)}
        />
        <LunaToolbarSpace />
        <ToolbarIcon
          icon="info"
          title={t('metadata')}
          onClick={() => setMetadataModalVisible(true)}
          disabled={!toBool(store.metadata)}
        />
        <ToolbarIcon icon="add" title={t('add')} onClick={addModel} />
        <ToolbarIcon
          icon="delete"
          title={t('delete')}
          onClick={deleteModel}
          disabled={!toBool(store.selectedModel)}
        />
      </LunaToolbar>
      <MetadataModal
        visible={metadataModalVisible}
        onClose={() => setMetadataModalVisible(false)}
      />
    </>
  )
})
