import { resolve } from './util.mjs'

export async function installUi() {
  const targetPath = resolve('easy-diffusion/ui')
  if (await fs.exists(targetPath)) {
    return
  }
  const srcPath = resolve('stable-diffusion-ui/ui')
  await fs.copy(srcPath, targetPath)
}
