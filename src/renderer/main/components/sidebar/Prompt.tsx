import { observer } from 'mobx-react-lite'
import Style from './Prompt.module.scss'
import { notify } from '../../../lib/util'
import { t } from '../../../../common/util'
import className from 'licia/className'
import store from '../../store'
import { editor } from 'monaco-editor'
import { useRef, useState } from 'react'
import LunaToolbar, {
  LunaToolbarButton,
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
import openFile from 'licia/openFile'
import convertBin from 'licia/convertBin'
import bytesToStr from 'licia/bytesToStr'
import { parseImage, parseText } from '../../lib/genData'
import startWith from 'licia/startWith'

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
    if (editor.getValue() !== store.project.prompt && !editor.hasTextFocus()) {
      editor.setValue(store.project.prompt)
    }
  }

  if (negativeEditorRef.current) {
    const editor = negativeEditorRef.current
    if (editor.getValue() !== store.project.negativePrompt) {
      editor.setValue(store.project.negativePrompt)
    }
  }

  const importAll = () => {
    openFile({
      accept: 'image/png,image/jpeg,text/plain',
    }).then(async (fileList) => {
      const file = fileList[0]
      if (file) {
        if (editorFocus || negativeEditorFocus) {
          ;(document.activeElement as any).blur()
        }
        const buf = await convertBin.blobToArrBuffer(file)
        if (file.type === 'text/plain') {
          const text = bytesToStr(convertBin(buf, 'Uint8Array'))
          store.project.setGenOptions(parseText(text))
        } else if (startWith(file.type, 'image')) {
          const imageInfo = await parseImage(
            convertBin(buf, 'base64'),
            file.type
          )
          if (imageInfo.prompt) {
            store.project.setGenOptions(imageInfo)
          } else {
            notify(t('importErr'), { icon: 'error' })
          }
        } else {
          notify(t('importErr'), { icon: 'error' })
        }
      }
    })
  }

  const pasteAll = async () => {
    if (editorFocus || negativeEditorFocus) {
      ;(document.activeElement as any).blur()
    }
    const text = await navigator.clipboard.readText()
    store.project.setGenOptions(parseText(text))
  }

  const getSelectedEditor = () => {
    return negativeEditorFocus ? negativeEditorRef.current! : editorRef.current!
  }

  const theme = store.theme === 'dark' ? 'vivy-dark' : 'vs'

  return (
    <>
      <div className={Style.toolbar} onMouseDown={(e) => e.preventDefault()}>
        <LunaToolbar>
          <LunaToolbarButton onClick={() => {}}>
            <CopyButton
              className="toolbar-icon"
              onClick={() => copyPrompt(getSelectedEditor())}
            />
          </LunaToolbarButton>
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
            icon="open-file"
            title={t('import')}
            onClick={importAll}
          />
          <LunaToolbarSeparator />
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
          defaultValue={store.project.prompt}
          onChange={(value) => store.project.setPrompt(value || '')}
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
          defaultValue={store.project.negativePrompt}
          onChange={(value) => {
            store.project.setNegativePrompt(value || '')
          }}
          onMount={negativePromptOnMount}
        />
      </div>
    </>
  )
})
