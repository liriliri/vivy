import builder from 'electron-builder'

cd('dist')

const pkg = await fs.readJson('package.json')

const config = {
  directories: {
    output: `../release/${pkg.version}`,
  },
  files: ['main', 'preload', 'renderer', 'webui'],
  asarUnpack: ['webui/**/*'],
  win: {
    target: [
      {
        target: 'zip',
      },
    ],
  },
}

await builder.build({
  config,
})
