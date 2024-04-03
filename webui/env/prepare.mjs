#!/usr/bin/env zx
import { execa } from 'execa'
import extend from 'licia/extend.js'
import isWindows from 'licia/isWindows.js'
import { resolve, getPlatform } from './util.mjs'

const platform = getPlatform()

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

  const env = {
    PATH,
  }

  if (platform === 'osx') {
    extend(env, {
      COMMANDLINE_ARGS:
        '--skip-torch-cuda-test --upcast-sampling --no-half-vae --no-half --use-cpu interrogate',
      TORCH_COMMAND: 'pip install torch==2.1.0 torchvision==0.16.0',
      PYTORCH_ENABLE_MPS_FALLBACK: '1',
    })
  }

  await execa('python', ['launch.py', '--api', '--no-start'], {
    cwd: appDir,
    stdio: 'inherit',
    env,
  })
}

main()
