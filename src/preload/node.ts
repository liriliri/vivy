import fs from 'fs'

export default {
  writeFile: fs.promises.writeFile,
  readFile: fs.promises.readFile,
  existsSync: fs.existsSync,
}
