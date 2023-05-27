import types from 'licia/types'
import h from 'licia/h'

export function createToolbarIcon(iconName: string, handler: types.anyFn) {
  return h(
    '.icon',
    {},
    h(`span.icon-${iconName}`, {
      onclick: handler,
    })
  )
}
