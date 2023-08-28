import LunaModal from 'luna-modal/react'
import { observer } from 'mobx-react-lite'
import { createPortal } from 'react-dom'
import LunaSetting, {
  LunaSettingButton,
  LunaSettingSelect,
  LunaSettingCheckbox,
} from 'luna-setting/react'
import { t } from '../../../lib/util'
import store from '../../../main/store'
import Style from './Settings.module.scss'

interface IProps {
  visible: boolean
  onClose?: () => void
}

export default observer(function Settings(props: IProps) {
  return createPortal(
    <LunaModal
      title={t('settings')}
      visible={props.visible}
      onClose={props.onClose}
    >
      <LunaSetting
        className={Style.settings}
        onChange={(key, val) => store.setSettings(key, val)}
      >
        <LunaSettingSelect
          keyName="theme"
          value={store.settings.theme}
          title={t('theme')}
          options={{
            [t('light')]: 'light',
            [t('dark')]: 'dark',
          }}
        />
        <LunaSettingSelect
          keyName="language"
          value={store.settings.language}
          title={t('language')}
          options={{
            English: 'en-US',
            ['中文']: 'zh-CN',
          }}
        />
        <LunaSettingCheckbox
          keyName="enableWebUI"
          value={store.settings.enableWebUI}
          description={t('enableWebUI')}
        />
        <LunaSettingButton
          description={t('restartVivy')}
          onClick={() => main.relaunch()}
        />
      </LunaSetting>
    </LunaModal>,
    document.body
  )
})
