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
    autorun(() => {
      toolbar.clear()
      if (!isEmpty(store.models)) {
        const options = {}
        each(store.models, (model) => {
          options[model.name] = model.name
        })
        toolbar.appendSelect('model', '', 'Model', options)
      } else {
        toolbar.appendSelect('model', 'loading', {
          loading: 'loading',
        })
      }
    })
    return () => toolbar.destroy()
  }, [])

  return <div id="toolbar" ref={toolbarRef}></div>
}
