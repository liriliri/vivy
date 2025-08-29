import LunaDataGrid from 'luna-data-grid/react'
import Style from './ModelList.module.scss'
import { observer } from 'mobx-react-lite'
import { t } from '../../../common/util'
import store from '../store'
import { IModel } from '../../../common/types'
import { useRef } from 'react'
import DataGrid from 'luna-data-grid'
import { useResizeSensor } from 'share/renderer/lib/hooks'

export default observer(function ModelList() {
  const containerRef = useRef<HTMLDivElement>(null)
  const dataGridRef = useRef<DataGrid>(null)

  useResizeSensor(containerRef, () => {
    dataGridRef.current?.fit()
  })

  return (
    <div ref={containerRef} className={Style.container}>
      <LunaDataGrid
        className={Style.modelList}
        data={store.data}
        filter={store.filter}
        onSelect={(node) => {
          let model: IModel | null = null
          for (let i = 0, len = store.models.length; i < len; i++) {
            const m = store.models[i]
            if (m.name === node.data.name) {
              model = m
              break
            }
          }
          if (model) {
            store.selectModel(model)
          }
        }}
        selectable={true}
        onDeselect={() => store.selectModel()}
        columns={columns}
        onCreate={(dataGrid) => {
          dataGridRef.current = dataGrid
          dataGrid.fit()
        }}
      />
    </div>
  )
})

const columns = [
  {
    id: 'name',
    title: t('fileName'),
    weight: 50,
    sortable: true,
  },
  {
    id: 'size',
    title: t('fileSize'),
    weight: 20,
    sortable: true,
  },
  {
    id: 'created',
    title: t('createdDate'),
    weight: 30,
    sortable: true,
  },
]
