import LunaToolbar, {
  LunaToolbarSelect,
  LunaToolbarSeparator,
  LunaToolbarSpace,
} from 'luna-toolbar/react'
import Style from './Toolbar.module.scss'
import store from '../store'
import { ModelType } from '../../../common/types'
import { t } from '../../lib/util'
import ToolbarIcon from '../../components/ToolbarIcon'
import toBool from 'licia/toBool'
import { observer } from 'mobx-react-lite'
import LunaModal from 'luna-modal'

export default observer(function Toolbar() {
  const onChange = (key, val) => {
    if (key === 'type') {
      store.selectType(val)
    }
  }

  const deleteModel = async () => {
    const result = await LunaModal.confirm(
      t('deleteModelConfirm', { name: store.selectedModel })
    )
    if (result) {
      await main.deleteModel(store.selectedType, store.selectedModel!)
    }
  }

  return (
    <LunaToolbar className={Style.toolbar} onChange={onChange}>
      <LunaToolbarSelect
        keyName="type"
        value={store.selectedType}
        options={{
          'Stable Diffusion': ModelType.StableDiffusion,
          Lora: ModelType.Lora,
          RealESRGAN: ModelType.RealESRGAN,
          ScuNET: ModelType.ScuNET,
          Embedding: ModelType.Embedding,
        }}
      />
      <LunaToolbarSpace />
      <ToolbarIcon
        icon="delete"
        title={t('delete')}
        onClick={deleteModel}
        disabled={!toBool(store.selectedModel)}
      />
      <LunaToolbarSeparator />
      <ToolbarIcon
        icon="open-file"
        title={t('openDir')}
        onClick={() => {
          main.openModelDir(store.selectedType)
        }}
      />
    </LunaToolbar>
  )
})
