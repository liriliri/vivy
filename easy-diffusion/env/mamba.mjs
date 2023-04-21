import { getInstallerFiles } from './util.mjs'
import os from 'os'

const installDir = getInstallerFiles('mamba')
const envDir = getInstallerFiles('env')
const installPath = installDir + '/micromamba'

function getPlatform() {
  let platform = os.platform()

  switch(platform) {
    case 'linux':
      break;
    case 'darwin':
      platform = 'osx';
      break;
    default:
      platform = 'unknown';
  }

  return platform
}

function getArch() {
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

export async function installMamba() {
  if (await fs.exists(installPath)) {
    return
  }
  const platform = getPlatform()
  const arch = getArch() 
  if (platform === 'unknown' || arch === 'unknown') {
    return
  }
  const downloadUrl = `https://micro.mamba.pm/api/micromamba/${platform}-${arch}/latest`
  await fs.ensureDir(installDir)
  console.log(downloadUrl)
  await $`curl -L ${downloadUrl} | tar -xvj -O bin/micromamba > ${installPath}`
  await $`chmod +x ${installPath}`
  await $`echo "Micromamba version:"`
  await $`${installPath} --version`
}

export async function installPackages(packages) {
  await installMamba()
  if (!(await fs.exists(envDir))) {
    await $`${installPath} create -y --prefix ${envDir}`
  }
  await $`${installPath} install -y --prefix ${envDir} -c conda-forge ${packages}`
}