import fs from 'fs-extra'
import memoize from 'licia/memoize'
import { getUserDataPath } from './util'
import FileStore from 'licia/FileStore'
import Store from 'licia/Store'

fs.exists(getUserDataPath('data'), function (exists) {
  if (!exists) {
    fs.mkdirp(getUserDataPath('data'))
  }
})

export const getMainStore = memoize(function () {
  return new FileStore(getUserDataPath('data/main.json'), {
    bounds: {
      width: 1280,
      height: 850,
    },
    recentProjects: [],
  })
})

export const getTerminalStore = memoize(function () {
  return new FileStore(getUserDataPath('data/terminal.json'), {
    bounds: {
      width: 960,
      height: 640,
    },
  })
})

export const getModelStore = memoize(function () {
  return new FileStore(getUserDataPath('data/model.json'), {
    bounds: {
      width: 960,
      height: 640,
    },
  })
})

export const getDownloadStore = memoize(function () {
  return new FileStore(getUserDataPath('data/download.json'), {
    bounds: {
      width: 640,
      height: 480,
    },
  })
})

export const getPromptStore = memoize(function () {
  return new FileStore(getUserDataPath('data/prompt.json'), {
    bounds: {
      width: 960,
      height: 640,
    },
  })
})

export const getSystemStore = memoize(function () {
  return new FileStore(getUserDataPath('data/system.json'), {
    bounds: {},
  })
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
  return new FileStore(getUserDataPath('data/webui.json'), {
    bounds: {
      width: 1280,
      height: 850,
    },
  })
})

export const getPainterStore = memoize(function () {
  return new FileStore(getUserDataPath('data/painter.json'), {
    bounds: {
      width: 960,
      height: 640,
    },
  })
})

export const getMemStore = memoize(function () {
  return new Store({})
})
