import LunaDataGrid from 'luna-data-grid/react'
import { useEffect, useState } from 'react'
import Style from './ModelList.module.scss'
import fileSize from 'licia/fileSize'
import { observer } from 'mobx-react-lite'
import { t } from '../../lib/util'
import map from 'licia/map'
import dateFormat from 'licia/dateFormat'
import store from '../store'

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

  const data = map(store.models, (model) => {
    return {
      name: model.name,
      size: `${fileSize(model.size)}B`,
      created: dateFormat(new Date(model.createdDate), 'yyyy-mm-dd HH:MM:ss'),
    }
  })

  return (
    <LunaDataGrid
      className={Style.modelList}
      data={data}
      columns={columns}
      minHeight={height}
      maxHeight={height}
    />
  )
})
