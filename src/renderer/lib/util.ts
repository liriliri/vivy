import I18n from 'licia/I18n'
import extend from 'licia/extend'
import en from '../locales/en.json'
import zhCN from '../locales/zh-CN.json'

export async function invokeMain(api) {
  return await (window as any).main[api]()
}

export function invokeNodeSync(api) {
  return (window as any).node[api]()
}

export function isDev() {
  return import.meta.env.MODE === 'development'
}

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
