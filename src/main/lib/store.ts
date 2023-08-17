import fs from 'licia/fs'
import mkdir from 'licia/mkdir'
import memoize from 'licia/memoize'
import { getUserDataPath } from './util'
import FileStore from 'licia/FileStore'

fs.exists(getUserDataPath('data')).then((exists) => {
  if (!exists) {
    mkdir(getUserDataPath('data'))
  }
})

export const getMainStore = memoize(function () {
  return new FileStore(getUserDataPath('data/main.json'), {
    bounds: {
      width: 1280,
      height: 850,
    },
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
