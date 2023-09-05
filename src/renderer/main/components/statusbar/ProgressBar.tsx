import { observer } from 'mobx-react-lite'
import unique from 'licia/unique'
import concat from 'licia/concat'
import isEqual from 'licia/isEqual'
import each from 'licia/each'
import clone from 'licia/clone'
import Style from './ProgressBar.module.scss'
import store from '../../store'
import { TaskStatus } from '../../store/task'
import { useState } from 'react'

export default observer(function () {
  const [isGenerating, setIsGenerating] = useState(false)
  const [tasks, setTasks] = useState<typeof store.tasks>([])
  if (!isGenerating) {
    if (store.tasks.length > 0) {
      setIsGenerating(true)
      setTasks(clone(store.tasks))
    }
  } else {
    if (store.tasks.length === 0) {
      setTimeout(() => {
        setIsGenerating(false)
        setTasks([])
      }, 1000)
    } else {
      const newTasks = unique(concat(tasks, store.tasks))
      if (!isEqual(newTasks, tasks)) {
        setTasks(newTasks)
      }
    }
  }

  let total = 0
  let complete = 0
  each(tasks, (task) => {
    const len = task.images.length
    total += len
    if (task.status === TaskStatus.Complete) {
      complete += len
    } else if (task.status === TaskStatus.Generating) {
      complete += (task.progress / 100) * len
    }
  })
  const progress = Math.round((complete / total) * 100)

  return (
    <div
      className={Style.progressBar}
      style={{
        opacity: isGenerating ? 1 : 0,
        width: `${progress}%`,
      }}
    ></div>
  )
})
