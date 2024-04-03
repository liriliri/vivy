import { action, makeObservable, observable, runInAction } from 'mobx'

interface IDevice {
  id: string
  name: string
}

export class Settings {
  language = 'en-US'
  theme = 'light'
  translator = 'bing'
  enableWebUI = false
  modelPath = ''
  device = ''
  devices: IDevice[] = []
  constructor() {
    makeObservable(this, {
      language: observable,
      theme: observable,
      enableWebUI: observable,
      modelPath: observable,
      device: observable,
      devices: observable,
      set: action,
    })

    this.init()
  }
  async init() {
    const names = [
      'language',
      'theme',
      'enableWebUI',
      'modelPath',
      'device',
      'devices',
    ]
    for (let i = 0, len = names.length; i < len; i++) {
      const name = names[i]
      const val = await main.getSettingsStore(name)
      if (val) {
        runInAction(() => (this[name] = val))
      }
    }
  }
  async getDevices() {
    const devices = await main.getDevices()
    await main.setSettingsStore('devices', devices)
    const device = await main.getSettingsStore('device')
    runInAction(() => {
      this.device = device
      this.devices = devices
    })
  }
  async set(name: string, val: any) {
    runInAction(() => {
      this[name] = val
    })
    await main.setSettingsStore(name, val)
  }
}
