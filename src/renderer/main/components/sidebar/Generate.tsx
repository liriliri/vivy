import className from 'licia/className'
import Style from './Generate.module.scss'
import store from '../../store'
import { t } from '../../../lib/util'

export default function () {
  return (
    <div
      className={className(Style.generate, 'button', 'primary')}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => store.createGenTask()}
    >
      {t('generate')}
    </div>
  )
}
