import { resolve } from './util.mjs'

export async function installUi() {
  const targetPath = resolve('ui')
  if (await fs.exists(targetPath)) {
    return
  }
  const srcPath = resolve('stable-diffusion-ui/ui')
  await fs.copy(srcPath, targetPath)
}
