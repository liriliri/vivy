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
    '!**/sd-webui-controlnet/{tests,uni_tests,web_tests,samples,example}',

    '!**/site-packages/**/__pycache__',
    '!**/site-packages/{collada,colorama,fsspec,h11,importlib_resources,jsonschema,jsonschema_specifications,lazy_loader,lib2to3,matplotlib,mpmath,opt_einsum,pandas,psutil,referencing,shapely,toolz}/tests',
    '!**/site-packages/{mpl_toolkits,numpy,scipy,skimage,sklearn,sympy}/**/tests',
    '!**/site-packages/joblib/test',
    '!**/site-packages/mediapipe/**/test',
    '!**/site-packages/torch/include',
    '!**/site-packages/torch/lib/*.lib',
    ...ignoreSitePackages,

    // mac
    '!**/env/lib/tcl*',
    '!**/env/lib/terminfo',
    // windows
    '!**/env/Library/lib/tcl*',
  ],
  asarUnpack: ['webui/**/*'],
  artifactName: '${productName}-${version}-${os}-${arch}.${ext}',
  fileAssociations: {
    ext: 'vivy',
  },
  win: {
    target: [
      {
        target: '7z',
      },
    ],
  },
  mac: {
    electronLanguages: ['zh_CN', 'en'],
    target: [
      {
        target: 'dmg',
      },
    ],
  },
  publish: {
    provider: 'generic',
    url: 'https://release.liriliri.io/',
    channel: '${productName}-latest',
  },
}

await builder.build({
  config,
})
