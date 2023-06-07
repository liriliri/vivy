import LunaDataGrid from 'luna-data-grid'
import { useEffect, useRef } from 'react'
import './ModelList.scss'

export default function ModelList() {
  const dataGridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dataGrid = new LunaDataGrid(dataGridRef.current as HTMLDivElement, {
      columns: [
        {
          id: 'fileName',
          title: 'File Name',
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
          id: '',
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

    return () => {
      window.removeEventListener('resize', updateHeight)
      dataGrid.destroy()
    }
  }, [])

  return <div id="model-list" ref={dataGridRef}></div>
}
