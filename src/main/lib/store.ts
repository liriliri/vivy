import fs from 'licia/fs'
import mkdir from 'licia/mkdir'
import { getUserDataPath } from './util'
import FileStore from 'licia/FileStore'

fs.exists(getUserDataPath('data')).then((exists) => {
  if (!exists) {
    mkdir(getUserDataPath('data'))
  }
})

let mainStore: FileStore

export function getMainStore(data: any) {
  if (mainStore) {
    return mainStore
  }

  mainStore = new FileStore(getUserDataPath('data/main.json'), data)

  return mainStore
}

let terminalStore: FileStore

export function getTerminalStore(data: any) {
  if (terminalStore) {
    return terminalStore
  }

  terminalStore = new FileStore(getUserDataPath('data/terminal.json'), data)

  return terminalStore
}
