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
    '!**/mamba',
    '!**/taming-transformers/{data,assets}',
    '!**/stable-diffusion-stability-ai/assets',
    '!**/site-packages/**/__pycache__',
    '!**/site-packages/torch/include',
    '!**/site-packages/torch/lib/*.lib',
  ],
  asarUnpack: ['webui/**/*'],
  electronLanguages: ['zh_CN', 'en'],
  win: {
    target: [
      {
        target: 'zip',
      },
    ],
  },
  mac: {},
}

await builder.build({
  config,
})
