import { useEffect, useRef } from 'react'
import LunaToolbar, { LunaToolbarSelect } from 'luna-toolbar/react'
import store from '../../store'
import each from 'licia/each'
import isEmpty from 'licia/isEmpty'
import types from 'licia/types'
import Style from './Toolbar.module.scss'
import { observer } from 'mobx-react-lite'

export default observer(function () {
  let options: types.PlainObj<string> = {}
  if (!isEmpty(store.models)) {
    options = {}
    each(store.models, (model) => {
      options[model] = model
    })
  } else {
    options = {
      loading: 'loading',
    }
  }

  return (
    <div className={Style.toolbar}>
      <LunaToolbar>
        <LunaToolbarSelect
          key="model"
          value={store.options.model}
          title="Model"
          options={options}
        />
      </LunaToolbar>
    </div>
  )
})
