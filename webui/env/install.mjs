#!/usr/bin/env zx
import { installPackages } from './mamba.mjs'
import { exportPath } from './util.mjs'

await installPackages(['python=3.10.6'])
exportPath()

if (process.env.GITHUB_ACTIONS !== 'true') {
  await $`python -m pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/`
}
