const pkg = await fs.readJson('package.json')
const electron = pkg.devDependencies.electron
delete pkg.devDependencies
pkg.devDependencies = {
  electron,
}
delete pkg.scripts
pkg.scripts = {
  start: 'electron main/index.js',
}
pkg.main = 'main/index.js'

await $`npm run build:main`
await $`npm run build:preload`
await $`npm run build:renderer`

await fs.copy('build', 'dist/build')
await fs.copy('webui/env', 'dist/webui/env')
await fs.copy('webui/script', 'dist/webui/script')
await $`./dist/webui/env/install.mjs`
cd('webui/stable-diffusion-webui')
await $`git archive --format=zip --output=stable-diffusion-webui.zip origin/vivy`
await $`unzip -o stable-diffusion-webui.zip -d ../../dist/webui/stable-diffusion-webui`
await $`rm stable-diffusion-webui.zip`
cd('../../dist')
await $`./webui/env/prepare.mjs`
await $`rm -rf ./webui/env`

await fs.writeJson('package.json', pkg, {
  spaces: 2,
})

await $`npm i`
