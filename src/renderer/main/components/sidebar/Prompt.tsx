import { observer } from 'mobx-react-lite'
import Style from './Prompt.module.scss'
import { t } from '../../../lib/util'
import className from 'licia/className'
import store from '../../store'
import { Editor } from '@monaco-editor/react'
import { useRef } from 'react'
import { colorBgContainerDark } from '../../../../common/theme'

export default observer(function () {
  const promptMonacoRef = useRef(null)
  const negativePromptMonacoRef = useRef(null)

  const promptBeforeMount = (monaco) => {
    monaco.editor.defineTheme('vivy-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': colorBgContainerDark,
      },
    })
  }

  const promptOnMount = (_, monaco) => {
    promptMonacoRef.current = monaco
  }

  const negativePromptOnMount = (_, monaco) => {
    negativePromptMonacoRef.current = monaco
  }

  const monacoOptions: any = {
    renderLineHighlight: 'none',
    lineNumbers: 'off',
    wordWrap: 'on',
    glyphMargin: false,
    folding: false,
    lineDecorationsWidth: 0,
    contextmenu: false,
    lineNumbersMinChars: 2,
    minimap: { enabled: false },
  }

  const theme = store.settings.theme === 'dark' ? 'vivy-dark' : 'vs'

  return (
    <div className={Style.generateBasic}>
      <div className={Style.prompt}>
        <Editor
          height={100}
          options={monacoOptions}
          theme={theme}
          defaultValue={store.txt2imgOptions.prompt}
          onChange={(value) => store.setTxt2ImgOptions('prompt', value)}
          beforeMount={promptBeforeMount}
          onMount={promptOnMount}
        />
      </div>
      <div className={Style.negativePrompt}>
        <Editor
          height={60}
          options={monacoOptions}
          theme={theme}
          defaultValue={store.txt2imgOptions.negativePrompt}
          onChange={(value) => store.setTxt2ImgOptions('negativePrompt', value)}
          beforeMount={promptBeforeMount}
          onMount={negativePromptOnMount}
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
