import I18n from 'licia/I18n'
import extend from 'licia/extend'
import en from '../../common/locales/en.json'
import zhCN from '../../common/locales/zh-CN.json'

export const i18n = new I18n('en', {
  en,
  zhCN: extend(en, zhCN),
})

switch (navigator.language) {
  case 'zh-CN':
    i18n.locale('zhCN')
    break
  default:
    i18n.locale('en')
}
