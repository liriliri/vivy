import path from 'path'

export function getInstallerFiles(p) {
  return resolve(`installer_files/${p}`)
}

export function resolve(p) {
  return path.resolve(__dirname, '../../', p)
}