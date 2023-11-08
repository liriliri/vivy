import { action, makeObservable, observable, runInAction } from 'mobx'
import { Settings } from '../store/settings'
import tags from '../assets/tags.json'
import keys from 'licia/keys'
import * as prompt from '../lib/prompt'
import { editor } from 'monaco-editor'

class Store {
  settings = new Settings()
  prompt = ''
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
    const txt2imgOptions = await main.getMainStore('txt2imgOptions')
    if (txt2imgOptions) {
      this.prompt = txt2imgOptions.prompt
    }
  }
  async setPrompt(prompt: string) {
    this.prompt = prompt
    const txt2imgOptions = await main.getMainStore('txt2imgOptions')
    if (txt2imgOptions) {
      txt2imgOptions.prompt = prompt
    }
    await main.setMainStore('txt2imgOptions', txt2imgOptions)
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
      if (name === 'txt2imgOptions') {
        runInAction(() => {
          if (this.prompt !== val.prompt) {
            this.prompt = val.prompt
          }
        })
      }
    })
  }
}

export default new Store()
