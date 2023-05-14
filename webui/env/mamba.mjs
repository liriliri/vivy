import { getInstallerFiles, getPlatform, getArch } from './util.mjs'

const platform = getPlatform()
const arch = getArch()
const installDir = getInstallerFiles('mamba')
const envDir = getInstallerFiles('env')
const installPath =
  installDir + '/micromamba' + (platform === 'win' ? '.exe' : '')

export async function installMamba() {
  if (
    (await fs.exists(installPath)) ||
    platform === 'unknown' ||
    arch === 'unknown'
  ) {
    return
  }

  await fs.ensureDir(installDir)
  if (platform === 'win') {
    const downloadUrl =
      'https://github.com/cmdr2/stable-diffusion-ui/releases/download/v1.1/micromamba.exe'
    await $`curl -Lk ${downloadUrl} > ${installPath}`
  } else {
    const downloadUrl = `https://micro.mamba.pm/api/micromamba/${platform}-${arch}/latest`
    await $`curl -L ${downloadUrl} | tar -xvj -O bin/micromamba > ${installPath}`
    await $`chmod +x ${installPath}`
  }
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
