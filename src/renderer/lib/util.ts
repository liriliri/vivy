export async function invokeMain(api) {
  return await (window as any).main[api]()
}

export function invokeNodeSync(api) {
  return (window as any).node[api]()
}

export function isDev() {
  return import.meta.env.MODE === 'development'
}
