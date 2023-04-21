#!/usr/bin/env zx
import { installPackages } from './mamba.mjs'
import { installUi } from './ui.mjs'
import { exportPath } from './util.mjs'
import { installCondaModules, installPipModules } from './python.mjs'
import { installModel } from './model.mjs'

await installPackages(['conda', 'python=3.8.5'])
exportPath()

await installUi()

await installPipModules(['torch==1.13.1', 'torchvision==0.14.1'])
await installPipModules(['sdkit==1.0.70'])
await installPipModules(['rich'])
await installCondaModules(['uvicorn', 'fastapi'])

await installModel(
  'stable-diffusion',
  'https://huggingface.co/CompVis/stable-diffusion-v-1-4-original/resolve/main/sd-v1-4.ckpt',
  'sd-v1-4.ckpt'
)
await installModel(
  'gfpgan',
  'https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.3.pth',
  'GFPGANv1.3.pth'
)
await installModel(
  'realesrgan',
  'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth',
  'RealESRGAN_x4plus.pth'
)
await installModel(
  'realesrgan',
  'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth',
  'RealESRGAN_x4plus_anime_6B.pth'
)
await installModel(
  'vae',
  'https://huggingface.co/stabilityai/sd-vae-ft-mse-original/resolve/main/vae-ft-mse-840000-ema-pruned.ckpt',
  'vae-ft-mse-840000-ema-pruned.ckpt'
)
