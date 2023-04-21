import path from 'path'

export function getInstallerFiles(p) {
  return path.resolve(__dirname, '../installer_files', p)
}