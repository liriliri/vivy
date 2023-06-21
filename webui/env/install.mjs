#!/usr/bin/env zx
import { installPackages } from './mamba.mjs'
import { exportPath } from './util.mjs'

await installPackages(['python=3.10.6'])
exportPath()

await $`python -m pip config set global.index-url https://pypi.mirrors.ustc.edu.cn/simple`
