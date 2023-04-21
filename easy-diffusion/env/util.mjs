import path from 'path'
import os from 'os'
import { fileURLToPath } from 'url'
import contain from 'licia/contain.js'

export function getInstallerFiles(p) {
  return resolve(`installer_files/${p}`)
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function resolve(p) {
  return path.resolve(__dirname, '../../', p)
}

export function getPlatform() {
  let platform = os.platform()

  switch (platform) {
    case 'darwin':
      platform = 'osx'
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

export function exportPath() {
  const path = getInstallerFiles('env/bin')
  if (contain(process.env.PATH, path)) {
    return
  }
  process.env.PATH = `${path}:${process.env.PATH}`
}
