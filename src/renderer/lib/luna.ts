import types from 'licia/types'
import h from 'licia/h'

export function toolbarIcon(iconName: string, handler: types.AnyFn) {
  return h(
    '.icon',
    {},
    h(`span.icon-${iconName}`, {
      onclick: handler,
    })
  )
}
