import LunaDataGrid from 'luna-data-grid'
import { useEffect, useRef } from 'react'
import Style from './ModelList.module.scss'
import store from '../store'
import { autorun } from 'mobx'

export default function ModelList() {
  const dataGridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dataGrid = new LunaDataGrid(dataGridRef.current as HTMLDivElement, {
      columns: [
        {
          id: 'modelName',
          title: 'Model Name',
        },
        {
          id: 'hash',
          title: 'File Hash',
        },
        {
          id: 'size',
          title: 'File Size',
        },
        {
          id: 'action',
          title: 'Action',
        },
      ],
    })

    function updateHeight() {
      const height = window.innerHeight - 30
      dataGrid.setOption({
        minHeight: height,
        maxHeight: height,
      } as any)
    }

    window.addEventListener('resize', updateHeight)

    updateHeight()

    autorun(() => {
      dataGrid.clear()
      console.log(store.models)
    })

    return () => {
      window.removeEventListener('resize', updateHeight)
      dataGrid.destroy()
    }
  }, [])

  return <div className={Style.modelList} ref={dataGridRef}></div>
}
