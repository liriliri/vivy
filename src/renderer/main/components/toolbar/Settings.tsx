import LunaModal from 'luna-modal/react'
import { observer } from 'mobx-react-lite'
import { createPortal } from 'react-dom'
import contain from 'licia/contain'
import LunaSetting, {
  LunaSettingButton,
  LunaSettingSelect,
  LunaSettingCheckbox,
  LunaSettingTitle,
  LunaSettingSeparator,
  LunaSettingInput,
} from 'luna-setting/react'
import { notify, t } from '../../../lib/util'
import store from '../../../main/store'
import Style from './Settings.module.scss'
import each from 'licia/each'
import SettingPath from '../../../components/SettingPath'
import isEmpty from 'licia/isEmpty'
import isStrBlank from 'licia/isStrBlank'

interface IProps {
  visible: boolean
  onClose?: () => void
}

export default observer(function Settings(props: IProps) {
  const onChange = (key, val) => {
    if (contain(['language', 'enableWebUI', 'device'], key)) {
      notify(t('requireReload'))
    }
    store.settings.set(key, val)
  }

  const deviceOptions: any = {}
  let deviceDisabled = false
  each(store.settings.devices, (device) => {
    deviceOptions[device.name] = device.id
  })
  if (
    isEmpty(store.settings.devices) ||
    !isStrBlank(store.settings.webUIPath)
  ) {
    deviceDisabled = true
    deviceOptions[t('empty')] = 'empty'
  }

  return createPortal(
    <LunaModal
      title={t('settings')}
      visible={props.visible}
      onClose={props.onClose}
    >
      <LunaSetting className={Style.settings} onChange={onChange}>
        <LunaSettingTitle title={t('appearance')} />
        <LunaSettingSelect
          keyName="theme"
          value={store.settings.theme}
          title={t('theme')}
          options={{
            [t('sysPreference')]: 'system',
            [t('light')]: 'light',
            [t('dark')]: 'dark',
          }}
        />
        <LunaSettingSelect
          keyName="language"
          value={store.settings.language}
          title={t('language')}
          options={{
            [t('sysPreference')]: 'system',
            English: 'en-US',
            ['中文']: 'zh-CN',
          }}
        />
        <LunaSettingSeparator />
        <LunaSettingTitle title="Stable Diffusion" />
        <LunaSettingSelect
          keyName="device"
          value={store.settings.device}
          title={t('device')}
          disabled={deviceDisabled}
          options={deviceOptions}
        />
        <SettingPath
          title={t('modelPath')}
          value={store.settings.modelPath}
          onChange={(val) => {
            notify(t('requireReload'))
            store.settings.set('modelPath', val)
          }}
          options={{
            properties: ['openDirectory'],
          }}
        />
        <SettingPath
          title={t('webUIPath')}
          value={store.settings.webUIPath}
          onChange={(val) => {
            notify(t('requireReload'))
            store.settings.set('webUIPath', val)
          }}
          options={{
            properties: ['openDirectory'],
          }}
        />
        <LunaSettingInput
          keyName="customArgs"
          title={t('customArgs')}
          value={store.settings.customArgs}
        />
        <LunaSettingCheckbox
          keyName="enableWebUI"
          value={store.settings.enableWebUI}
          description={t('enableWebUI')}
        />
        <LunaSettingSeparator />
        <LunaSettingTitle title={t('translation')} />
        <LunaSettingSelect
          keyName="translator"
          value={store.settings.translator}
          title={t('translationService')}
          options={{
            [t('bing')]: 'bing',
            [t('google')]: 'google',
          }}
        />
        <LunaSettingSeparator />
        <LunaSettingButton
          description={t('restartVivy')}
          onClick={() => main.relaunch()}
        />
      </LunaSetting>
    </LunaModal>,
    document.body
  )
})
