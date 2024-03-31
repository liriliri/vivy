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
} from 'luna-setting/react'
import { notify, t } from '../../../lib/util'
import store from '../../../main/store'
import Style from './Settings.module.scss'
import SettingPath from '../../../components/SettingPath'

interface IProps {
  visible: boolean
  onClose?: () => void
}

export default observer(function Settings(props: IProps) {
  const onChange = (key, val) => {
    if (contain(['language', 'enableWebUI'], key)) {
      notify(t('requireReload'))
    }
    store.settings.set(key, val)
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
