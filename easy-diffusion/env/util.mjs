import path from 'path'
import os from 'os'
import { fileURLToPath } from 'url'
import normalizePath from 'licia/normalizePath.js'
import contain from 'licia/contain.js'

export function getInstallerFiles(p) {
  return resolve(`installer_files/${p}`)
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function resolve(p) {
  return normalizePath(path.resolve(__dirname, '../', p))
}

export function getPlatform() {
  let platform = os.platform()

  switch (platform) {
    case 'darwin':
      platform = 'osx'
      break
    case 'win32':
      platform = 'win'
      break
    default:
      platform = 'unknown'
  }

  return platform
}

export function getArch() {
  let arch = os.arch()

  switch (arch) {
    case 'x64':
      arch = '64'
      break
    case 'arm64':
      arch = 'arm64'
      break
    default:
      arch = 'unknown'
  }

  return arch
}

function addPathToEnv(path) {
  const platform = getPlatform()

  if (!contain(process.env.PATH, path)) {
    if (platform === 'win') {
      process.env.PATH = `${path};${process.env.PATH}`
    } else {
      process.env.PATH = `${path}:${process.env.PATH}`
    }
  }
}

export function exportPath() {
  const platform = getPlatform()

  if (platform === 'win') {
    addPathToEnv(getInstallerFiles('env'))
    addPathToEnv(getInstallerFiles('env/Library/bin'))
    addPathToEnv(getInstallerFiles('env/Scripts'))
  } else {
    addPathToEnv(getInstallerFiles('env/bin'))
  }
}
