import { execa } from 'execa'
import isWindows from 'licia/isWindows.js'
import { resolve } from './util.mjs'

async function main() {
  const appDir = resolve('stable-diffusion-webui')

  let PATH = process.env.PATH
  if (isWindows) {
    const binPath = resolve('installer_files/env')
    PATH = `${binPath};${PATH}`
  } else {
    const binPath = resolve('installer_files/env/bin')
    PATH = `${binPath}:${PATH}`
  }

  await execa('python', ['launch.py', '--api'], {
    cwd: appDir,
    stdio: 'inherit',
    env: {
      PATH,
    },
  })
}

main()
