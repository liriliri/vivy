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
    'pywt',
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
    '!**/env/{share,include,conda-meta,man,ssl}',

    '!**/stable-diffusion-webui/test',
    '!**/taming-transformers/{data,assets}',
    '!**/stable-diffusion-stability-ai/assets',

    '!**/site-packages/**/__pycache__',
    '!**/site-packages/{fsspec,h11,importlib_resources,jsonschema,jsonschema_specifications,lazy_loader,lib2to3,matplotlib,mpmath,pandas,psutil,referencing,toolz}/tests',
    '!**/site-packages/{mpl_toolkits,numpy,scipy,skimage,sympy}/**/tests',
    '!**/site-packages/torch/include',
    '!**/site-packages/torch/lib/*.lib',
    ...ignoreSitePackages,

    // mac
    '!**/env/lib/tcl*',
    // windows
    '!**/env/Library/lib/tcl*',
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
