import { observer } from 'mobx-react-lite'
import PromptEditor, {
  copyPrompt,
  pastePrompt,
  clearPrompt,
  formatPrompt,
  translatePrompt,
} from '../../components/PromptEditor'
import store from '../store'
import Style from './Prompt.module.scss'
import LunaToolbar, {
  LunaToolbarHtml,
  LunaToolbarSeparator,
} from 'luna-toolbar/react'
import CopyButton from '../../components/CopyButton'
import { useRef, useState } from 'react'
import className from 'licia/className'
import { editor } from 'monaco-editor'
import ToolbarIcon from '../../components/ToolbarIcon'
import { t } from '../../lib/util'

export default observer(function Prompt() {
  const editorRef = useRef<editor.IStandaloneCodeEditor>()
  const [editorFocus, setEditorFocus] = useState(false)

  if (editorRef.current) {
    const editor = editorRef.current
    if (editor.getValue() !== store.prompt && !editor.hasTextFocus()) {
      editor.setValue(store.prompt)
    }
  }

  const promptOnMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
    editor.onDidFocusEditorWidget(() => setEditorFocus(true))
    editor.onDidBlurEditorWidget(() => setEditorFocus(false))
  }

  const theme = store.settings.theme === 'dark' ? 'vivy-dark' : 'vs'

  return (
    <div className={Style.container}>
      <div className={Style.toolbar} onMouseDown={(e) => e.preventDefault()}>
        <LunaToolbar>
          <LunaToolbarHtml>
            <CopyButton onClick={() => copyPrompt(editorRef.current!)} />
          </LunaToolbarHtml>
          <ToolbarIcon
            icon="paste"
            title={t('paste')}
            onClick={() => pastePrompt(editorRef.current!)}
          />
          <ToolbarIcon
            icon="eraser"
            title={t('clear')}
            onClick={() => clearPrompt(editorRef.current!)}
          />
          <LunaToolbarSeparator />
          <ToolbarIcon
            icon="format"
            title={t('format')}
            onClick={() => formatPrompt(editorRef.current!)}
          />
          <ToolbarIcon
            icon="translate"
            title={t('translate')}
            disabled={store.settings.language === 'en-US'}
            onClick={() => translatePrompt(editorRef.current!)}
          />
        </LunaToolbar>
      </div>
      <div
        className={className(Style.prompt, {
          [Style.selected]: editorFocus,
        })}
      >
        <PromptEditor
          height={150}
          theme={theme}
          onMount={promptOnMount}
          onChange={(value) => store.setPrompt(value || '')}
          defaultValue={store.prompt}
        />
      </div>
    </div>
  )
})
