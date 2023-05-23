export async function invokeMain(api) {
  return await (window as any).main[api]()
}

export function invokeNodeSync(api) {
  return (window as any).node[api]()
}
