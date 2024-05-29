import { expect, test } from 'vitest'
import * as prompt from '../src/renderer/lib/prompt'

test('format', () => {
  expect(prompt.format('【colorful】')).toBe('[colorful]')
})
