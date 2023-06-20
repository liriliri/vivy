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

await fs.copy('webui/env', 'dist/webui/env')
await $`./dist/webui/env/install.mjs`
await $`rm -rf ./dist/webui/env`
cd('webui/stable-diffusion-webui')
await $`git archive --format=zip --output=stable-diffusion-webui.zip vivy`
await $`unzip -o stable-diffusion-webui.zip -d ../../dist/webui/stable-diffusion-webui`
await $`rm stable-diffusion-webui.zip`
cd('../../dist')

await fs.writeJson('package.json', pkg, {
  spaces: 2,
})

await $`npm i`

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
