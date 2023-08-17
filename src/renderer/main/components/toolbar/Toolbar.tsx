import LunaToolbar, {
  LunaToolbarHtml,
  LunaToolbarSelect,
  LunaToolbarSeparator,
  LunaToolbarSpace,
} from 'luna-toolbar/react'
import store from '../../store'
import each from 'licia/each'
import isEmpty from 'licia/isEmpty'
import types from 'licia/types'
import Style from './Toolbar.module.scss'
import { observer } from 'mobx-react-lite'
import { i18n, invokeMain } from '../../../lib/util'
import loadingImg from '../../../assets/img/loading.svg'
import ToolbarIcon from '../common/ToolbarIcon'

export default observer(function () {
  let modelOptions: types.PlainObj<string> = {}
  let modelDisabled = false
  if (!isEmpty(store.models)) {
    modelOptions = {}
    each(store.models, (model) => {
      modelOptions[model] = model
    })
  } else {
    modelDisabled = true
    modelOptions = {
      [i18n.t('loading')]: 'loading',
    }
  }

  const loading = (
    <LunaToolbarHtml>
      {store.isReady ? null : (
        <img className={Style.loading} src={loadingImg} />
      )}
    </LunaToolbarHtml>
  )

  return (
    <LunaToolbar
      className={Style.toolbar}
      onChange={(key, val) => {
        store.setOptions(key, val)
      }}
    >
      <LunaToolbarSelect
        keyName="model"
        value={store.options.model}
        title="Model"
        options={modelOptions}
        disabled={modelDisabled}
      />
      <ToolbarIcon
        icon="model"
        title={i18n.t('modelManager')}
        onClick={() => invokeMain('showModel')}
      />
      {loading}
      <LunaToolbarSpace />
      <ToolbarIcon
        icon="setting"
        title={i18n.t('modelManager')}
        onClick={() => {}}
      />
    </LunaToolbar>
  )
})
