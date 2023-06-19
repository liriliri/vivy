#!/usr/bin/env zx
import { installPackages } from './mamba.mjs'
import { exportPath, resolve } from './util.mjs'

await installPackages(['python=3.10.6'])
exportPath()

await $`python -m pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple`

const targetPath = resolve('stable-diffusion-webui')
const patchPath = resolve('patch')
await fs.copy(patchPath, targetPath)
