import types from 'licia/types'
import h from 'licia/h'
import LunaToolbar from 'luna-toolbar'

export function toolbarIcon(
  iconName: string,
  handler: types.AnyFn,
  title = ''
) {
  return h(
    '.icon',
    {},
    h(`span.icon-${iconName}`, {
      onclick: handler,
      title,
    })
  )
}

export function toolbarSpace(toolbar: LunaToolbar) {
  const item = toolbar.appendHtml('')
  item.$container.css({
    flexGrow: '1',
  })
}
