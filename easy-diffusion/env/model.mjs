import { resolve } from './util.mjs'

export async function installModel(type, url, name) {
  const downloadDir = resolve(`models/${type}`)
  const downloadPath = downloadDir + '/' + name
  if (await fs.exists(downloadPath)) {
    return
  }
  await $`curl -L -k ${url} > ${downloadPath}`
}
