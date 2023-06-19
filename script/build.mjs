import builder from 'electron-builder'

const pkg = await fs.readJson('package.json')
const electron = pkg.devDependencies.electron
delete pkg.devDependencies
pkg.devDependencies = {
  electron,
}
delete pkg.scripts
pkg.main = 'main/index.js'

await $`npm run build:main`
await $`npm run build:preload`
await $`npm run build:renderer`

cd('dist')

await $`npm i`

await fs.writeJson('package.json', pkg, {
  spaces: 2,
})

const config = {
  asar: false,
  directories: {
    output: `../release/${pkg.version}`,
  },
  files: ['main', 'preload', 'renderer'],
}

await builder.build({
  config,
})
