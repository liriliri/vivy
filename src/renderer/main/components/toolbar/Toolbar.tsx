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
import { t } from '../../../lib/util'
import { LoadingBar } from '../../../components/loading'
import ToolbarIcon from '../../../components/ToolbarIcon'
import Settings from './Settings'
import { useState } from 'react'

export default observer(function () {
  const [settingsVisible, setSettingsVisible] = useState(false)

  let modelOptions: types.PlainObj<string> = {}
  let modelDisabled = false
  if (!isEmpty(store.models)) {
    modelOptions = {}
    each(store.models, (model) => {
      modelOptions[model] = model
    })
  } else {
    modelDisabled = true
    if (store.isReady) {
      modelOptions = {
        [t('empty')]: 'empty',
      }
    } else {
      modelOptions = {
        [t('loading')]: 'loading',
      }
    }
  }

  const vaeOptions = {
    [t('none')]: 'None',
    [t('automatic')]: 'Automatic',
  }
  if (!isEmpty(store.vaes)) {
    each(store.vaes, (vae) => {
      vaeOptions[vae] = vae
    })
  }

  const loading = (
    <LunaToolbarHtml>
      {store.isReady ? null : <LoadingBar className={Style.loading} />}
    </LunaToolbarHtml>
  )

  return (
    <>
      <LunaToolbar
        className={Style.toolbar}
        onChange={(key, val) => {
          store.setOptions(key, val)
        }}
      >
        <LunaToolbarSelect
          keyName="model"
          value={store.options.model}
          title={t('model')}
          options={modelOptions}
          disabled={modelDisabled}
        />
        <LunaToolbarSelect
          keyName="vae"
          value={store.options.vae}
          title={'VAE'}
          options={vaeOptions}
        />
        <ToolbarIcon
          icon="model"
          title={t('modelManager')}
          onClick={() => main.showModel()}
        />
        {loading}
        <LunaToolbarSpace />
        <ToolbarIcon
          icon={store.ui.sidebarCollapsed ? 'sidebar' : 'sidebar-fill'}
          title={t(store.ui.sidebarCollapsed ? 'showSidebar' : 'hideSidebar')}
          onClick={() => store.ui.toggle('sidebarCollapsed')}
        />
        <LunaToolbarSeparator />
        <ToolbarIcon
          icon="setting"
          title={t('settings')}
          onClick={() => setSettingsVisible(true)}
        />
      </LunaToolbar>
      <Settings
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </>
  )
})
