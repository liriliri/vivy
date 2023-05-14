import { execa } from 'execa'
import { resolve } from './util'
import getFreePort from 'licia/getPort'
import toStr from 'licia/toStr'
import isWindows from 'licia/isWindows'

let port = 7860
export const getPort = () => port

export async function start() {
  const appDir = resolve('webui/stable-diffusion-webui')

  let PATH = process.env.PATH
  if (isWindows) {
    const binPath = resolve('webui/installer_files/env')
    PATH = `${binPath};${PATH}`
  } else {
    const binPath = resolve('webui/installer_files/env/bin')
    PATH = `${binPath}:${PATH}`
  }

  port = await getFreePort(port)
  await execa('python', ['launch.py', '--api', '--port', toStr(port)], {
    cwd: appDir,
    stdout: 'inherit',
    stderr: 'inherit',
    env: {
      PATH,
    },
  })
}
