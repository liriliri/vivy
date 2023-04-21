#!/usr/bin/env zx
import { installPackages } from './mamba.mjs'
import { installUi } from './ui.mjs'
import { exportPath } from './util.mjs'

await installPackages(['conda', 'python=3.8.5'])
exportPath()

await installUi()
