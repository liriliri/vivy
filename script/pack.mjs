import builder from 'electron-builder'

cd('dist')

const pkg = await fs.readJson('package.json')

const config = {
  asar: false,
  directories: {
    output: `../release/${pkg.version}`,
  },
  files: ['main', 'preload', 'renderer', 'webui'],
}

await builder.build({
  config,
})
