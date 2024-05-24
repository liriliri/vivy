import { app } from 'electron'
import { getSettingsStore } from './store'
import isStrBlank from 'licia/isStrBlank'

const store = getSettingsStore()

function updateProxy() {
  const mode = store.get('proxyMode')
  if (mode === 'system' || mode === 'direct') {
    app.setProxy({
      mode,
    })
  } else if (mode === 'fixed_servers') {
    const host = store.get('proxyHost')
    if (!isStrBlank(host)) {
      app.setProxy({
        mode,
        proxyRules: host,
      })
    } else {
      app.setProxy({
        mode: 'system',
      })
    }
  }
}

export function init() {
  updateProxy()
  store.on('change', (name) => {
    if (name === 'proxyMode' || name === 'proxyHost') {
      updateProxy()
    }
  })
}
