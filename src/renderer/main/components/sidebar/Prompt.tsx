import { observer } from 'mobx-react-lite'
import Style from './Prompt.module.scss'
import { t } from '../../../lib/util'
import className from 'licia/className'
import store from '../../store'
import { editor } from 'monaco-editor'
import { useRef, useState } from 'react'
import LunaToolbar, {
  LunaToolbarHtml,
  LunaToolbarSeparator,
  LunaToolbarSpace,
} from 'luna-toolbar/react'
import ToolbarIcon from '../../../components/ToolbarIcon'
import CopyButton from '../../../components/CopyButton'
import PromptEditor, {
  copyPrompt,
  pastePrompt,
  clearPrompt,
  formatPrompt,
  translatePrompt,
} from '../../../components/PromptEditor'

export default observer(function () {
  const editorRef = useRef<editor.IStandaloneCodeEditor>()
  const negativeEditorRef = useRef<editor.IStandaloneCodeEditor>()
  const [editorFocus, setEditorFocus] = useState(false)
  const [negativeEditorFocus, setNegativeEditorFocus] = useState(false)

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
    if (
      editor.getValue() !== store.txt2imgOptions.prompt &&
      !editor.hasTextFocus()
    ) {
      editor.setValue(store.txt2imgOptions.prompt)
    }
  }

  if (negativeEditorRef.current) {
    const editor = negativeEditorRef.current
    if (editor.getValue() !== store.txt2imgOptions.negativePrompt) {
      editor.setValue(store.txt2imgOptions.negativePrompt)
    }
  }

  const pasteAll = async () => {
    if (editorFocus || negativeEditorFocus) {
      ;(document.activeElement as any).blur()
    }
    const text = await navigator.clipboard.readText()
    store.parseTxt2ImgOptionsText(text)
  }

  const getSelectedEditor = () => {
    return negativeEditorFocus ? negativeEditorRef.current! : editorRef.current!
  }

  const theme = store.settings.theme === 'dark' ? 'vivy-dark' : 'vs'

  return (
    <div className={Style.generateBasic}>
      <div className={Style.toolbar} onMouseDown={(e) => e.preventDefault()}>
        <LunaToolbar>
          <LunaToolbarHtml>
            <CopyButton onClick={() => copyPrompt(getSelectedEditor())} />
          </LunaToolbarHtml>
          <ToolbarIcon
            icon="paste"
            title={t('paste')}
            onClick={() => pastePrompt(getSelectedEditor())}
          />
          <ToolbarIcon
            icon="eraser"
            title={t('clear')}
            onClick={() => clearPrompt(getSelectedEditor())}
          />
          <LunaToolbarSeparator />
          <ToolbarIcon
            icon="format"
            title={t('format')}
            onClick={() => formatPrompt(getSelectedEditor())}
          />
          <ToolbarIcon
            icon="translate"
            title={t('translate')}
            disabled={store.settings.language === 'en-US'}
            onClick={() => translatePrompt(getSelectedEditor())}
          />
          <LunaToolbarSeparator />
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
        <PromptEditor
          height={100}
          theme={theme}
          defaultValue={store.txt2imgOptions.prompt}
          onChange={(value) => store.setTxt2ImgOptions('prompt', value || '')}
          onMount={promptOnMount}
        />
      </div>
      <div
        className={className(Style.negativePrompt, {
          [Style.selected]: negativeEditorFocus,
        })}
      >
        <PromptEditor
          height={60}
          theme={theme}
          defaultValue={store.txt2imgOptions.negativePrompt}
          onChange={(value) => {
            store.setTxt2ImgOptions('negativePrompt', value || '')
          }}
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
