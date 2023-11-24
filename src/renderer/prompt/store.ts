import { action, makeObservable, observable, runInAction } from 'mobx'
import { Settings } from '../store/settings'
import tags from '../assets/tags.json'
import keys from 'licia/keys'
import * as prompt from '../lib/prompt'
import now from 'licia/now'
import each from 'licia/each'
import shuffle from 'licia/shuffle'
import random from 'licia/random'
import randomItem from 'licia/randomItem'
import { editor } from 'monaco-editor'
import { searchTags } from '../lib/util'

class Store {
  settings = new Settings()
  prompt = ''
  setPromptTime = now()
  editor?: editor.IStandaloneCodeEditor
  categories = keys(tags)
  selectedCategory = 'image'
  selectedCategoryTags = tags['image']
  keyword = ''
  searchTags: string[] = []
  constructor() {
    makeObservable(this, {
      settings: observable,
      prompt: observable,
      searchTags: observable,
      setPrompt: observable,
      selectedCategory: observable,
      selectedCategoryTags: observable,
      keyword: observable,
      search: action,
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
  async random() {
    const result: string[] = []

    let subCategories: Array<string[]> = []
    each(tags, (category) => {
      each(category, (subCategory) => {
        subCategories.push(subCategory)
      })
    })
    const qualityCategory = subCategories.shift() as string[]
    subCategories = shuffle(subCategories)
    subCategories.unshift(qualityCategory)
    for (let i = 0, len = random(5, subCategories.length); i < len; i++) {
      const subCategory = subCategories[i]
      result.push(randomItem(subCategory))
    }

    this.setEditorValue(result.join(', '))
  }
  search(keyword: string) {
    this.keyword = keyword
    if (keyword) {
      this.searchTags = searchTags(keyword)
    } else {
      this.searchTags = []
    }
  }
  toggleTag(tag: string) {
    this.setEditorValue(prompt.toggleTag(this.prompt, tag))
  }
  selectCategory(category: string) {
    this.selectedCategory = category
    this.selectedCategoryTags = tags[category]
    this.search('')
  }
  private bindEvent() {
    main.on('changeMainStore', (_, name, val) => {
      if (name === 'prompt') {
        runInAction(() => {
          if (now() - this.setPromptTime < 500) {
            return
          }
          if (this.prompt !== val) {
            this.prompt = val
          }
        })
      }
    })
  }
  private setEditorValue(value: string) {
    const { editor } = this
    if (editor) {
      if (!editor.hasTextFocus()) {
        editor.focus()
      }
      editor.setValue(value)
    }
  }
}

export default new Store()
