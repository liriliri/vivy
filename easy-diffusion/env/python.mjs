import { getInstallerFiles, getPlatform } from './util.mjs'

const platform = getPlatform()

export async function installPipModules(modules, options = {}) {
  setPythonEnv()
  if (options.extraIndexUrl) {
    await $`python -m pip install --upgrade ${modules} --extra-index-url ${options.extraIndexUrl}`
  } else {
    await $`python -m pip install --upgrade ${modules}`
  }
}

export async function installCondaModules(modules) {
  setPythonEnv()
  await $`conda install -c conda-forge -y ${modules}`
}

function setPythonEnv() {
  process.env.PYTHONNOUSERSITE = 1
  if (platform === 'win') {
    process.env.PYTHONPATH = getInstallerFiles('env/Lib/site-packages')
  } else {
    process.env.PYTHONPATH = getInstallerFiles(
      'env/lib/python3.8/site-packages'
    )
  }
}
