import { createHash } from 'crypto'
import { createReadStream } from 'fs'

export function hashFile(
  file,
  algorithm = 'sha512',
  encoding = 'base64',
  options
) {
  return new Promise((resolve, reject) => {
    const hash = createHash(algorithm)
    hash.on('error', reject).setEncoding(encoding)

    createReadStream(file, { ...options, highWaterMark: 1024 * 1024 })
      .on('error', reject)
      .on('end', () => {
        hash.end()
        resolve(hash.read())
      })
      .pipe(hash, { end: false })
  })
}
