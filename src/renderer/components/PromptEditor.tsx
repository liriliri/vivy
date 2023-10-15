import { Editor, loader } from '@monaco-editor/react'
import { observer } from 'mobx-react-lite'
import { editor } from 'monaco-editor'
import * as monaco from 'monaco-editor'
import map from 'licia/map'
import copy from 'licia/copy'
import { getSuggestions, notify } from '../lib/util'
import {
  blue10,
  blue10Dark,
  blue8,
  blue8Dark,
  colorBgContainerDark,
  colorError,
  colorErrorDark,
  fontFamilyCode,
  green8,
  green8Dark,
  purple8,
  purple8Dark,
  yellow8,
  yellow8Dark,
} from '../../common/theme'
import * as prompt from '../lib/prompt'
import { t } from '../lib/util'

loader.config({ monaco })

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
  fontFamily: fontFamilyCode,
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
  number: /[+-]?[\d.]+/,
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

monaco.editor.defineTheme('vivy-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    {
      foreground: blue10Dark,
      token: 'string',
    },
    {
      foreground: blue8Dark,
      token: 'number',
    },
    {
      foreground: yellow8Dark,
      token: 'delimiter.parenthesis',
    },
    {
      foreground: yellow8Dark,
      token: 'delimiter.angle',
    },
    {
      foreground: purple8Dark,
      token: 'delimiter.bracket',
    },
    {
      foreground: green8Dark,
      token: 'keyword',
    },
    {
      foreground: colorErrorDark,
      token: 'invalid',
    },
  ],
  colors: {
    'editor.background': colorBgContainerDark,
  },
})
monaco.editor.defineTheme('vs', {
  base: 'vs',
  inherit: true,
  rules: [
    {
      foreground: blue10,
      token: 'string',
    },
    {
      foreground: blue8,
      token: 'number',
    },
    {
      foreground: yellow8,
      token: 'delimiter.parenthesis',
    },
    {
      foreground: yellow8,
      token: 'delimiter.angle',
    },
    {
      foreground: purple8,
      token: 'delimiter.bracket',
    },
    {
      foreground: green8,
      token: 'keyword',
    },
    {
      foreground: colorError,
      token: 'invalid',
    },
  ],
  colors: {},
})

monaco.languages.register({
  id: 'prompt',
})

monaco.languages.setMonarchTokensProvider('prompt', tokensProvider)

monaco.languages.registerCompletionItemProvider('prompt', {
  triggerCharacters: map(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    (c) => c
  ),
  provideCompletionItems: function (model, position) {
    const word = model.getWordUntilPosition(position)
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn,
    }

    const suggestions = map(getSuggestions(word.word, 5), (suggestion, idx) => {
      return {
        range,
        label: suggestion,
        kind: monaco.languages.CompletionItemKind.Text,
        insertText: suggestion,
        detail: t(`suggestion-${suggestion}`),
        sortText: 'abcde'[idx],
      }
    })

    return { suggestions: suggestions }
  },
})

export default observer(function PromptEditor(props: IProps) {
  return (
    <Editor
      options={monacoOptions}
      height={props.height}
      defaultValue={props.defaultValue}
      onMount={props.onMount}
      theme={props.theme}
      defaultLanguage="prompt"
      onChange={props.onChange}
    />
  )
})

export const copyPrompt = (editor: editor.IStandaloneCodeEditor) => {
  const value = getSelectionValue(editor)
  copy(value)
  editor.focus()
}

export const pastePrompt = async (editor: editor.IStandaloneCodeEditor) => {
  const text = await navigator.clipboard.readText()
  setSelectionValue(editor, text, 'paste')
}

export const clearPrompt = (editor: editor.IStandaloneCodeEditor) => {
  setSelectionValue(editor, '', 'clear')
}

export const formatPrompt = (editor: editor.IStandaloneCodeEditor) => {
  const value = getSelectionValue(editor)
  setSelectionValue(editor, prompt.format(value), 'format')
}

export const translatePrompt = async (editor: editor.IStandaloneCodeEditor) => {
  const value = getSelectionValue(editor)
  try {
    setSelectionValue(editor, await main.translate(value), 'translate')
  } catch (e) {
    notify(t('translateErr'))
  }
}

function getSelectionValue(editor: editor.IStandaloneCodeEditor) {
  const selection = editor.getSelection()
  if (selection && !selection.isEmpty()) {
    return editor.getModel()!.getValueInRange(selection)
  }
  return editor.getValue()
}

function setSelectionValue(
  editor: editor.IStandaloneCodeEditor,
  text: string,
  source = 'unknown'
) {
  const selection = editor.getSelection()
  if (selection && !selection.isEmpty()) {
    editor.executeEdits(source, [
      {
        range: selection,
        text,
      },
    ])
  } else {
    editor.executeEdits(source, [
      {
        range: editor.getModel()!.getFullModelRange()!,
        text,
      },
    ])
  }
  editor.focus()
}
