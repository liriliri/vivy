import LunaToolbar, { LunaToolbarSelect } from 'luna-toolbar/react'
import Style from './Toolbar.module.scss'
import store from '../store'
import { ModelType } from '../../../common/types'

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
        }}
      />
    </LunaToolbar>
  )
}
