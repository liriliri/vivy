import { Editor } from '@monaco-editor/react'
import { observer } from 'mobx-react-lite'
import { editor } from 'monaco-editor'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { colorBgContainerDark } from '../../common/theme'

type Monaco = typeof monaco
type Theme = 'vs-dark' | 'light'
type OnMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => void
type OnChange = (
  value: string | undefined,
  ev: editor.IModelContentChangedEvent
) => void

interface IProps {
  height?: number | string
  defaultValue?: string
  theme?: Theme | string
  onChange?: OnChange
  onMount?: OnMount
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

/**
 * test prompt
 * 1word, multiple words,
 * \(increase\), a (increase word), ((increase)), (increase:1.5),
 * \[decrease\], a [decrease word], [[decrease]], [decrease:0.1],
 * \<lora\>, <hypernet:filename>, <lora:filename:1.2>
 */
const tokensProvider: monaco.languages.IMonarchLanguage = {
  defaultToken: 'invalid',
  keywords: ['lora', 'hypernet'],
  brackets: [
    { open: '[', close: ']', token: 'delimiter.bracket' },
    { open: '(', close: ')', token: 'delimiter.parenthesis' },
    { open: '<', close: '>', token: 'delimiter.angle' },
  ],
  number: /[+-]?[\d\.]+/,
  word: /([a-zA-Z_-]|')+/,
  tokenizer: {
    root: [{ include: '@prompts' }],
    prompts: [
      { include: '@whitespace' },
      [',', 'delimiter'],
      {
        include: '@escape',
      },
      [/[>)\]:]/, 'invalid'],
      [/@number/, 'number'],
      ['<', '@brackets', '@extra'],
      ['\\(', '@brackets', '@increase'],
      ['\\[', '@brackets', '@decrease'],
      [/@word/, 'string'],
    ],
    extra: [
      ['>', '@brackets', '@pop'],
      ['<', 'invalid'],
      [
        /@word/,
        {
          cases: { '@keywords': 'keyword', '@default': 'string' },
        },
      ],
      [':', 'operator', '@extraId'],
    ],
    extraId: [
      ['>', '@brackets', '@popall'],
      [/[^:>]+/, 'string'],
      [':', 'operator', '@extraParam'],
    ],
    extraParam: [
      ['>', '@brackets', '@popall'],
      [/@number/, 'number', '@pop'],
    ],
    increase: [
      ['\\)', '@brackets', '@pop'],
      [':', 'operator', '@increaseFactor'],
      { include: '@prompts' },
    ],
    increaseFactor: [[/@number/, 'number', '@pop']],
    decrease: [
      [']', '@brackets', '@pop'],
      [':', 'operator', '@decreaseFactor'],
      { include: '@prompts' },
    ],
    decreaseFactor: [[/@number/, 'number', '@pop']],
    escape: [[/\\./, 'string.escape']],
    whitespace: [[/[ \t\r\n]+/, 'white']],
  },
}

export default observer(function PromptEditor(props: IProps) {
  const beforeMount = (monaco: Monaco) => {
    monaco.editor.defineTheme('vivy-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': colorBgContainerDark,
      },
    })
    monaco.languages.register({
      id: 'prompt',
    })
    monaco.languages.setMonarchTokensProvider('prompt', tokensProvider)
  }

  return (
    <Editor
      options={monacoOptions}
      height={props.height}
      defaultValue={props.defaultValue}
      onMount={props.onMount}
      theme={props.theme}
      defaultLanguage="prompt"
      onChange={props.onChange}
      beforeMount={beforeMount}
    />
  )
})
