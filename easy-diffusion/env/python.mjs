import { getInstallerFiles } from './util.mjs'

export async function installPipModules(modules) {
  setPythonEnv()
  await $`python -m pip install --upgrade ${modules}`
}

export async function installCondaModules(modules) {
  setPythonEnv()
  await $`conda install -c conda-forge -y ${modules}`
}

function setPythonEnv() {
  process.env.PYTHONNOUSERSITE = 1
  process.env.PYTHONPATH = getInstallerFiles('env/lib/python3.8/site-packages')
}
