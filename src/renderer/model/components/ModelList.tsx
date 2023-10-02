import LunaDataGrid from 'luna-data-grid/react'
import { useEffect, useState } from 'react'
import Style from './ModelList.module.scss'
import { observer } from 'mobx-react-lite'
import { t } from '../../lib/util'

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
      id: 'name',
      title: t('fileName'),
    },
    {
      id: 'size',
      title: t('fileSize'),
    },
    {
      id: 'created',
      title: t('createdDate'),
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
