import path from 'path'
import os, { platform } from 'os'

export function getInstallerFiles(p) {
  return resolve(`installer_files/${p}`)
}

export function resolve(p) {
  return path.resolve(__dirname, '../../', p)
}

export function getPlatform() {
  let platform = os.platform()

  switch(platform) {
    case 'darwin':
      platform = 'osx';
      break;
    default:
      platform = 'unknown';
  }

  return platform
}

export function getArch() {
  let arch = os.arch();

  switch (arch) {
    case 'x64':
      arch = '64';
      break;
    case 'arm64':
      arch = 'arm64';
      break;
    default:
      arch = 'unknown';  
  }

  return arch
}
