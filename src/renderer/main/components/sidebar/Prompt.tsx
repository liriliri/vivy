import { observer } from 'mobx-react-lite'
import Style from './Prompt.module.scss'
import { t } from '../../../lib/util'
import className from 'licia/className'
import store from '../../store'

export default observer(function () {
  return (
    <div className={Style.generateBasic}>
      <div className={Style.prompt}>
        <textarea
          placeholder={t('prompt')}
          spellCheck="false"
          value={store.txt2imgOptions.prompt}
          onChange={(e) => {
            store.setTxt2ImgOptions('prompt', e.target.value)
          }}
        />
      </div>
      <div className={Style.negativePrompt}>
        <textarea
          placeholder={t('negativePrompt')}
          spellCheck="false"
          value={store.txt2imgOptions.negativePrompt}
          onChange={(e) => {
            store.setTxt2ImgOptions('negativePrompt', e.target.value)
          }}
        />
      </div>
      <button
        className={className(Style.generate, 'button')}
        onClick={() => store.createTask()}
      >
        {t('generate')}
      </button>
    </div>
  )
})
