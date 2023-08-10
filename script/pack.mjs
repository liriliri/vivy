import builder from 'electron-builder'

cd('dist')

const pkg = await fs.readJson('package.json')

const config = {
  directories: {
    output: `../release/${pkg.version}`,
  },
  files: [
    'main',
    'preload',
    'renderer',
    'webui',
    '!**/*.{js.map,md,MD}',
    '!**/taming-transformers/{data,assets}',
    '!**/stable-diffusion-stability-ai/assets',
    '!**/site-packages/torch/include',
  ],
  asarUnpack: ['webui/**/*'],
  win: {
    target: [
      {
        target: 'zip',
      },
    ],
  },
  mac: {
    electronLanguages: ['zh_CN', 'en'],
  },
}

await builder.build({
  config,
})
