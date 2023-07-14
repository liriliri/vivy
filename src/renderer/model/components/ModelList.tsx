import LunaDataGrid from 'luna-data-grid/react'
import { useEffect, useState } from 'react'
import Style from './ModelList.module.scss'
import { observer } from 'mobx-react-lite'

export default observer(function ModelList() {
  const [height, setHeight] = useState(window.innerHeight - 30)

  useEffect(() => {
    function updateHeight() {
      setHeight(window.innerHeight - 30)
    }

    window.addEventListener('resize', updateHeight)

    return () => {
      window.removeEventListener('resize', updateHeight)
    }
  }, [])

  const columns = [
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
  ]

  return (
    <LunaDataGrid
      className={Style.modelList}
      columns={columns}
      minHeight={height}
      maxHeight={height}
    />
  )
})
