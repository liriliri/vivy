import { action, makeObservable, observable, runInAction } from 'mobx'
import { getSystemLanguage } from '../lib/util'
import isDarkMode from 'licia/isDarkMode'

export class Settings {
  language = getSystemLanguage()
  theme = isDarkMode() ? 'dark' : 'light'
  translator = 'bing'
  enableWebUI = false
  modelPath = ''
  constructor() {
    makeObservable(this, {
      language: observable,
      theme: observable,
      enableWebUI: observable,
      modelPath: observable,
      set: action,
      load: action,
    })

    this.load()
    this.bindEvent()
  }
  async load() {
    const names = ['language', 'theme', 'enableWebUI', 'modelPath']
    for (let i = 0, len = names.length; i < len; i++) {
      const name = names[i]
      const val = await main.getSettingsStore(name)
      if (val) {
        runInAction(() => (this[name] = val))
      }
    }
  }
  async set(name: string, val: any) {
    this[name] = val
    await main.setSettingsStore(name, val)
  }
  private bindEvent() {
    main.on('changeSettingsStore', (_, name, val) => {
      if (name === 'theme') {
        this.theme = val
      }
    })
  }
}
