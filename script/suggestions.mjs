#!/usr/bin/env zx
import naturalSort from 'licia/naturalSort.js'
import each from 'licia/each.js'
import concat from 'licia/concat.js'
import map from 'licia/map.js'
import trim from 'licia/trim.js'
import path from 'path'
import unique from 'licia/unique.js'

let suggestions = []
let weights = {}
let zhCN = {}

// https://github.com/mahavivo/english-wordlists/blob/master/COCA_20000.txt
async function processCoca() {
  const data = await fs.readFile(
    path.resolve(__dirname, 'suggestions/COCA_20000.txt'),
    'utf8'
  )
  const lines = data.split('\n')
  const len = lines.length
  each(lines, (line, idx) => {
    line = trim(line)
    lines[idx] = line
    weights[line] = len + 1 - idx
  })

  suggestions = concat(suggestions, lines)
}

async function processCustom() {
  const data = await fs.readFile(
    path.resolve(__dirname, 'suggestions/custom.csv'),
    'utf8'
  )
  const lines = data.split('\n')
  const tags = []
  each(lines, (line, idx) => {
    line = trim(line)
    if (!line) {
      return
    }
    let [tag, zh] = line.split(',')
    tag = trim(tag)
    zh = trim(zh)
    tags.push(tag)
    weights[tag] = 10000 + idx
    zhCN[tag] = zh
  })

  suggestions = suggestions.concat(suggestions, tags)
}

// https://github.com/DominikDoom/a1111-sd-webui-tagcomplete/discussions/23
async function processDanbooru() {
  const data = await fs.readFile(
    path.resolve(__dirname, 'suggestions/danbooru-0-zh.csv'),
    'utf8'
  )
  const lines = data.split('\n')
  const tags = []
  each(lines, (line, idx) => {
    line = trim(line)
    if (!line) {
      return
    }
    let [tag, type, zh] = line.split(',')
    tag = trim(tag)
    zh = trim(zh)
    tags.push(tag)
    weights[tag] = 20000 + idx
    zhCN[tag] = zh
  })

  suggestions = suggestions.concat(suggestions, tags)
}

await processCoca()
await processCustom()
await processDanbooru()

suggestions = unique(suggestions)
naturalSort(suggestions)
suggestions = map(
  suggestions,
  (suggestion) => suggestion + ',' + weights[suggestion]
)
await fs.writeFile(
  path.resolve(__dirname, '../src/renderer/assets/suggestions.txt'),
  suggestions.join('\n'),
  'utf8'
)

zhCN = map(zhCN, (zh, suggestion) => suggestion + ',' + zh)
await fs.writeFile(
  path.resolve(__dirname, '../src/renderer/assets/suggestions-zh-CN.txt'),
  zhCN.join('\n'),
  'utf8'
)
