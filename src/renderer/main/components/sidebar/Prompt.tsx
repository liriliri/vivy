import { observer } from 'mobx-react-lite'
import Style from './Prompt.module.scss'
import { t } from '../../../lib/util'
import className from 'licia/className'
import store from '../../store'
import { Editor } from '@monaco-editor/react'
import { useRef } from 'react'
import { editor } from 'monaco-editor'

export default observer(function () {
  const promptMonacoRef = useRef(null)
  const negativePromptMonacoRef = useRef(null)

  const promptOnMount = (_, monaco) => {
    promptMonacoRef.current = monaco
  }

  const negativePromptOnMount = (_, monaco) => {
    negativePromptMonacoRef.current = monaco
  }

  const monacoOptions: editor.IStandaloneEditorConstructionOptions = {
    renderLineHighlight: 'none',
    lineNumbers: 'off',
    wordWrap: 'on',
    glyphMargin: false,
    folding: false,
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 2,
    minimap: { enabled: false },
  }

  const theme = store.settings.theme === 'dark' ? 'vs-dark' : 'light'

  return (
    <div className={Style.generateBasic}>
      <div className={Style.prompt}>
        <Editor
          height={100}
          options={monacoOptions}
          theme={theme}
          defaultValue={store.txt2imgOptions.prompt}
          onChange={(value) => store.setTxt2ImgOptions('prompt', value)}
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
