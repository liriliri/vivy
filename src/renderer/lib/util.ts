export async function invokeMain(api) {
  return await (window as any).main[api]()
}

export function invokeNodeSync(api) {
  return (window as any).node[api]()
}

export async function getEasyDiffusionUrl(url: string) {
  const port = await invokeMain('getEasyDiffusionPort')
  return `http://127.0.0.1:${port}/${url}`
}
