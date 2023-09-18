import { action, makeObservable, observable, runInAction } from 'mobx'
import { Settings } from '../store/settings'

class Store {
  settings = new Settings()
  prompt = ''
  constructor() {
    makeObservable(this, {
      settings: observable,
      prompt: observable,
      setPrompt: observable,
      load: action,
    })

    this.load()
    this.bindEvent()
  }
  async load() {
    const txt2imgOptions = await main.getMainStore('txt2imgOptions')
    if (txt2imgOptions) {
      this.prompt = txt2imgOptions.prompt
    }
  }
  async setPrompt(prompt: string) {
    this.prompt = prompt
    const txt2imgOptions = await main.getMainStore('txt2imgOptions')
    if (txt2imgOptions) {
      txt2imgOptions.prompt = prompt
    }
    await main.setMainStore('txt2imgOptions', txt2imgOptions)
  }
  bindEvent() {
    main.on('changeMainStore', (_, name, val) => {
      if (name === 'txt2imgOptions') {
        runInAction(() => {
          if (this.prompt !== val.prompt) {
            this.prompt = val.prompt
          }
        })
      }
    })
  }
}

export default new Store()
