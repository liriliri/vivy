import I18n from 'licia/I18n'
import types from 'licia/types'
import extend from 'licia/extend'
import en from '../locales/en.json'
import zhCN from '../locales/zh-CN.json'

export async function invokeMain(api, ...args) {
  return await (window as any).main[api](...args)
}

export function ipcOnEvent(event: string, cb: types.AnyFn) {
  ;(window as any).preload.ipcOnEvent(event, cb)
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
