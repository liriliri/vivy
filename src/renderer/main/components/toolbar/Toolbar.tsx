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
import { t } from '../../../../common/util'
import { LoadingBar } from 'share/renderer/components/loading'
import ToolbarIcon from 'share/renderer/components/ToolbarIcon'
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
    if (store.isWebUIErr) {
      modelDisabled = true
    }
  } else {
    modelDisabled = true
    if (store.isWebUIReady || store.isWebUIErr) {
      modelOptions = {
        [t('empty')]: 'empty',
      }
    } else {
      modelOptions = {
        [t('loading')]: 'loading',
      }
    }
  }

  if (!isEmpty(store.tasks)) {
    modelDisabled = true
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
      {store.isWebUIReady || store.isWebUIErr ? null : (
        <LoadingBar
          className={Style.loading}
          onClick={() => {
            main.showTerminal()
          }}
        />
      )}
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
          disabled={modelDisabled}
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
