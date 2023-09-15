import { observer } from 'mobx-react-lite'
import PromptEditor from '../../components/PromptEditor'
import store from '../store'
import Style from './Prompt.module.scss'
import LunaToolbar, { LunaToolbarHtml } from 'luna-toolbar/react'
import CopyButton from '../../components/CopyButton'
import { useRef } from 'react'
import copy from 'licia/copy'
import { editor } from 'monaco-editor'
import ToolbarIcon from '../../components/ToolbarIcon'
import { t } from '../../lib/util'

export default observer(function Prompt() {
  const editorRef = useRef<editor.IStandaloneCodeEditor>()

  const promptOnMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
  }

  const copyPrompt = () => {
    const editor = editorRef.current!
    let value = editor.getValue()
    const selection = editor.getSelection()
    if (selection && !selection.isEmpty()) {
      value = editor.getModel()!.getValueInRange(selection)
    }
    copy(value)
    editor.focus()
  }

  const pastePrompt = async () => {
    const text = await navigator.clipboard.readText()
    editorRef.current!.setValue(text)
  }

  const clearPrompt = () => editorRef.current!.setValue('')

  const theme = store.settings.theme === 'dark' ? 'vivy-dark' : 'vs'

  return (
    <div className={Style.container}>
      <div className={Style.toolbar} onMouseDown={(e) => e.preventDefault()}>
        <LunaToolbar>
          <LunaToolbarHtml>
            <CopyButton onClick={copyPrompt} />
          </LunaToolbarHtml>
          <ToolbarIcon icon="paste" title={t('paste')} onClick={pastePrompt} />
          <ToolbarIcon icon="eraser" title={t('clear')} onClick={clearPrompt} />
        </LunaToolbar>
      </div>
      <div className={Style.prompt}>
        <PromptEditor height={120} theme={theme} onMount={promptOnMount} />
      </div>
    </div>
  )
})
