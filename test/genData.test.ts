import { expect, test } from 'vitest'
import * as genData from '../src/renderer/main/lib/genData'

const prompt =
  '(masterpiece:1.2, best quality), blonde hair, (finely detailed beautiful eyes: 1.2), (detailed background,dark fantasy), (beautiful detailed face), high contrast, (best illumination, an extremely delicate and beautiful), ((cinematic light)), colorful, hyper detail, dramatic light, intricate details standing, cute clothes, magic'
const negativePrompt =
  '(worst quality, low quality:1.4), (zombie, sketch, interlocked fingers, comic)'
const steps = 30
const cfgScale = 7
const clipSkip = 2
const width = 512
const height = 768
const model = 'meinamix_meinaV11'
const sampler = 'Euler a'
const scheduler = 'automatic'
const seed = 3835376811

const expected = {
  prompt,
  negativePrompt,
  steps,
  cfgScale,
  clipSkip,
  width,
  height,
  model,
  sampler,
  scheduler,
  seed,
}

const a1111 = `${prompt}
Negative prompt: ${negativePrompt}
Steps: ${steps}, Sampler: ${sampler}, Schedule type: ${scheduler}, CFG scale: ${cfgScale}, Seed: ${seed}, Size: ${width}x${height}, Model: ${model}, Clip skip: ${clipSkip}, Eta: 0.0, Version: 1.9.3`

test('a1111', () => {
  expect(genData.parseText(a1111)).toEqual(expected)
})
