import { action, makeObservable, observable, runInAction } from 'mobx'
import { Settings } from '../store/settings'
import tags from '../assets/tags.json'
import keys from 'licia/keys'
import * as prompt from '../lib/prompt'
import now from 'licia/now'
import { editor } from 'monaco-editor'

class Store {
  settings = new Settings()
  prompt = ''
  setPromptTime = now()
  editor?: editor.IStandaloneCodeEditor
  categories = keys(tags)
  selectedCategory = 'image'
  selectedCategoryTags = tags['image']
  constructor() {
    makeObservable(this, {
      settings: observable,
      prompt: observable,
      setPrompt: observable,
      selectedCategory: observable,
      selectedCategoryTags: observable,
      load: action,
    })

    this.load()
    this.bindEvent()
  }
  async load() {
    this.prompt = (await main.getMainStore('prompt')) || ''
  }
  async setPrompt(prompt: string) {
    this.prompt = prompt
    this.setPromptTime = now()
    await main.setMainStore('prompt', prompt)
  }
  toggleTag(tag: string) {
    const { editor } = this
    const value = prompt.toggleTag(this.prompt, tag)
    if (editor) {
      if (!editor.hasTextFocus()) {
        editor.focus()
      }
      editor.setValue(value)
    }
  }
  selectCategory(category: string) {
    this.selectedCategory = category
    this.selectedCategoryTags = tags[category]
  }
  bindEvent() {
    main.on('changeMainStore', (_, name, val) => {
      if (name === 'genOptions') {
        runInAction(() => {
          if (now() - this.setPromptTime < 500) {
            return
          }
          if (this.prompt !== val.prompt) {
            this.prompt = val.prompt
          }
        })
      }
    })
  }
}

export default new Store()
