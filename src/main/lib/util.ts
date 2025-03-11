import splitPath from 'licia/splitPath'

export function replaceExt(file, newExt) {
  const { ext } = splitPath(file)
  return file.replace(ext, newExt)
}
