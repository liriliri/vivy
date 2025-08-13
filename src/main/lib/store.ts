import fs from 'fs-extra'
import memoize from 'licia/memoize'
import { getUserDataPath } from 'share/main/lib/util'
import FileStore from 'licia/FileStore'

fs.exists(getUserDataPath('data'), function (exists) {
  if (!exists) {
    fs.mkdirp(getUserDataPath('data'))
  }
})

export const getMainStore = memoize(function () {
  return new FileStore(getUserDataPath('data/main.json'), {
    recentProjects: [],
  })
})

export const getModelStore = memoize(function () {
  return new FileStore(getUserDataPath('data/model.json'), {})
})

export const getSettingsStore = memoize(function () {
  return new FileStore(getUserDataPath('data/settings.json'), {
    language: 'system',
    theme: 'system',
    enableWebUI: false,
    modelPath: getUserDataPath('models'),
    webUIPath: '',
    pythonPath: '',
    translator: 'bing',
    customArgs: '',
    vramOptimization: 'none',
    proxyMode: 'system',
    proxyHost: '',
  })
})

export const getWebUIStore = memoize(function () {
  return new FileStore(getUserDataPath('data/webui.json'), {})
})
