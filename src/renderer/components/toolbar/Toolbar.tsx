import { useEffect, useRef } from 'react'
import LunaToolbar from 'luna-toolbar'
import store from '../../store'
import each from 'licia/each'
import isEmpty from 'licia/isEmpty'
import './Toolbar.scss'
import { autorun } from 'mobx'

export default function () {
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const toolbar = new LunaToolbar(toolbarRef.current as HTMLDivElement)
    toolbar.on('change', (key, val) => {
      store.setOptions(key, val)
    })
    autorun(() => {
      toolbar.clear()
      if (!isEmpty(store.models)) {
        const options = {}
        each(store.models, (model) => {
          options[model] = model
        })
        toolbar.appendSelect('model', store.options.model, 'Model', options)
      } else {
        toolbar
          .appendSelect('model', 'loading', {
            loading: 'loading',
          })
          .disable()
      }
    })
    return () => toolbar.destroy()
  }, [])

  return <div id="toolbar" ref={toolbarRef}></div>
}
