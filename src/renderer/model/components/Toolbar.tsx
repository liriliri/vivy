import LunaToolbar, {
  LunaToolbarSelect,
  LunaToolbarSpace,
} from 'luna-toolbar/react'
import Style from './Toolbar.module.scss'
import store from '../store'
import { ModelType } from '../../../common/types'
import { t } from '../../lib/util'
import ToolbarIcon from '../../components/ToolbarIcon'

export default function Toolbar() {
  const onChange = (key, val) => {
    if (key === 'type') {
      store.selectType(val)
    }
  }

  return (
    <LunaToolbar className={Style.toolbar} onChange={onChange}>
      <LunaToolbarSelect
        keyName="type"
        value={store.type}
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
        icon="open-file"
        title={t('openDir')}
        onClick={() => {
          main.openModelDir(store.type)
        }}
      />
    </LunaToolbar>
  )
}
