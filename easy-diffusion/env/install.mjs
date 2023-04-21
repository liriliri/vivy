#!/usr/bin/env zx
import { installPackages } from './mamba.mjs'
import { installUi } from './ui.mjs'
import { exportPath } from './util.mjs'
import { installCondaModules, installPipModules } from './python.mjs'

await installPackages(['conda', 'python=3.8.5'])
exportPath()

await installUi()

await installPipModules(['torch==1.13.1', 'torchvision==0.14.1'])
await installPipModules(['sdkit==1.0.70'])
await installPipModules(['rich'])
await installCondaModules(['uvicorn', 'fastapi'])
