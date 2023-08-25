import { observer } from 'mobx-react-lite'
import Style from './Prompt.module.scss'
import { t } from '../../../lib/util'
import className from 'licia/className'
import store from '../../store'
import { Editor, Monaco } from '@monaco-editor/react'
import { editor } from 'monaco-editor'
import { useRef, useState } from 'react'
import { colorBgContainerDark } from '../../../../common/theme'

export default observer(function () {
  const editorRef = useRef<editor.IStandaloneCodeEditor>()
  const negativeEditorRef = useRef<editor.IStandaloneCodeEditor>()
  const selectedEditorRef = useRef<editor.IStandaloneCodeEditor>()
  const [editorFocus, setEditorFocus] = useState(false)
  const [negativeEditorFocus, setNegativeEditorFocus] = useState(false)

  const promptBeforeMount = (monaco: Monaco) => {
    monaco.editor.defineTheme('vivy-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': colorBgContainerDark,
      },
    })
  }

  const promptOnMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
    selectedEditorRef.current = editor
    editor.onDidFocusEditorWidget(() => setEditorFocus(true))
    editor.onDidBlurEditorWidget(() => setEditorFocus(false))
  }

  const negativePromptOnMount = (editor: editor.IStandaloneCodeEditor) => {
    negativeEditorRef.current = editor
    editor.onDidFocusEditorWidget(() => setNegativeEditorFocus(true))
    editor.onDidBlurEditorWidget(() => {
      setNegativeEditorFocus(false)
      if (selectedEditorRef.current === negativeEditorRef.current) {
        selectedEditorRef.current = editorRef.current
      }
    })
  }

  const monacoOptions: editor.IStandaloneEditorConstructionOptions = {
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
      <div
        className={className(Style.prompt, {
          [Style.selected]: editorFocus,
        })}
      >
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
      <div
        className={className(Style.negativePrompt, {
          [Style.selected]: negativeEditorFocus,
        })}
      >
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
