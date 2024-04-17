import builder from 'electron-builder'
import map from 'licia/map.js'

cd('dist')

const pkg = await fs.readJson('package.json')

const ignoreSitePackages = map(
  [
    'aiohttp',
    'fontTools',
    'llvmlite',
    'networkx',
    'numba',
    'pip',
    'test',
    'tzdata',
  ],
  (item) => {
    return `!**/site-packages/{${item},${item}-*-info}`
  }
)

const config = {
  directories: {
    output: `../release/${pkg.version}`,
  },
  files: [
    'main',
    'preload',
    'renderer',
    'webui',
    '!**/*.{js.map,md,MD,a,c,h,cpp,pc,tcl}',
    '!**/{.github,mamba}',
    '!**/taming-transformers/{data,assets}',
    '!**/stable-diffusion-stability-ai/assets',
    '!**/env/{share,include,conda-meta,man,ssl}',
    '!**/env/lib/tcl*',
    '!**/site-packages/**/__pycache__',
    '!**/site-packages/torch/include',
    '!**/site-packages/torch/lib/*.lib',
    '!**/site-packages/pandas/tests',
    ...ignoreSitePackages,
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
