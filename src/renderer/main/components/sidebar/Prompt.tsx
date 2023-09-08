import { observer } from 'mobx-react-lite'
import Style from './Prompt.module.scss'
import { t } from '../../../lib/util'
import className from 'licia/className'
import copy from 'licia/copy'
import store from '../../store'
import { Editor, Monaco } from '@monaco-editor/react'
import { editor } from 'monaco-editor'
import { useRef, useState } from 'react'
import { colorBgContainerDark } from '../../../../common/theme'
import LunaToolbar, {
  LunaToolbarHtml,
  LunaToolbarSeparator,
  LunaToolbarSpace,
} from 'luna-toolbar/react'
import ToolbarIcon from '../../../components/ToolbarIcon'
import CopyButton from '../../../components/CopyButton'

export default observer(function () {
  const editorRef = useRef<editor.IStandaloneCodeEditor>()
  const negativeEditorRef = useRef<editor.IStandaloneCodeEditor>()
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
    editor.onDidFocusEditorWidget(() => setEditorFocus(true))
    editor.onDidBlurEditorWidget(() => setEditorFocus(false))
  }

  const negativePromptOnMount = (editor: editor.IStandaloneCodeEditor) => {
    negativeEditorRef.current = editor
    editor.onDidFocusEditorWidget(() => setNegativeEditorFocus(true))
    editor.onDidBlurEditorWidget(() => setNegativeEditorFocus(false))
  }

  if (editorRef.current) {
    const editor = editorRef.current
    if (editor.getValue() !== store.txt2imgOptions.prompt) {
      editor.setValue(store.txt2imgOptions.prompt)
    }
  }

  if (negativeEditorRef.current) {
    const editor = negativeEditorRef.current
    if (editor.getValue() !== store.txt2imgOptions.negativePrompt) {
      editor.setValue(store.txt2imgOptions.negativePrompt)
    }
  }

  const clearPrompt = () => getSelectedEditor().setValue('')

  const copyPrompt = () => {
    const editor = getSelectedEditor()
    let value = editor.getValue()
    const selection = editor.getSelection()
    if (selection && !selection.isEmpty()) {
      value = editor.getModel()!.getValueInRange(selection)
    }
    copy(value)
    editor.focus()
  }

  const translate = async () => {
    const editor = getSelectedEditor()
    const value = editor.getValue()
    editor.setValue(await main.translate(value))
  }

  const pastePrompt = async () => {
    const text = await navigator.clipboard.readText()
    const editor = getSelectedEditor()
    editor.setValue(text)
  }

  const pasteAll = async () => {
    const text = await navigator.clipboard.readText()
    store.parseTxt2ImgOptionsText(text)
  }

  const getSelectedEditor = () => {
    return negativeEditorFocus ? negativeEditorRef.current! : editorRef.current!
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
      <div className={Style.toolbar} onMouseDown={(e) => e.preventDefault()}>
        <LunaToolbar>
          <LunaToolbarHtml>
            <CopyButton onClick={copyPrompt} />
          </LunaToolbarHtml>
          <ToolbarIcon icon="paste" title={t('paste')} onClick={pastePrompt} />
          <ToolbarIcon icon="eraser" title={t('clear')} onClick={clearPrompt} />
          <LunaToolbarSeparator />
          <ToolbarIcon
            icon="translate"
            title={t('translate')}
            disabled={store.settings.language === 'en-US'}
            onClick={translate}
          />
          <ToolbarIcon
            icon="editor"
            title={t('promptBuilder')}
            onClick={() => main.showPrompt()}
          />
          <LunaToolbarSpace />
          <ToolbarIcon
            icon="down-left"
            title={t('pasteAll')}
            onClick={pasteAll}
          />
        </LunaToolbar>
      </div>
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
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => store.createTask()}
      >
        {t('generate')}
      </button>
    </div>
  )
})
