import { getInstallerFiles, getPlatform, getArch } from './util.mjs'

const installDir = getInstallerFiles('mamba')
const envDir = getInstallerFiles('env')
const installPath = installDir + '/micromamba'

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
