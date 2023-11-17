import { observer } from 'mobx-react-lite'
import Style from './TagSelector.module.scss'
import LunaTab, { LunaTabItem } from 'luna-tab/react'
import Tab from 'luna-tab'
import map from 'licia/map'
import debounce from 'licia/debounce'
import { t } from '../../lib/util'
import className from 'licia/className'
import store from '../store'
import * as prompt from '../../lib/prompt'
import { useRef } from 'react'

export default observer(function TagSelector() {
  const tabRef = useRef<Tab>()

  const tabItems = map(store.categories, (category) => {
    return (
      <LunaTabItem
        key={category}
        id={category}
        title={t(category)}
        selected={category === store.selectedCategory}
      />
    )
  })

  let tags: JSX.Element[] = []
  if (store.keyword) {
    tags = []
  } else {
    tags = map(store.selectedCategoryTags, (tags, subCategory) => {
      return (
        <div className={Style.category} key={subCategory}>
          <div className={Style.categoryTitle}>{t(subCategory)}</div>
          {map(tags, (tag) => {
            const translation = t(`suggestion-${tag}`)
            return (
              <span
                className={className(Style.tag, {
                  [Style.selected]: prompt.hasTag(store.prompt, tag),
                })}
                key={tag}
                onClick={() => toggleTag(tag)}
                title={translation ? tag : ''}
              >
                {translation || tag}
              </span>
            )
          })}
        </div>
      )
    })
  }

  function search(keyword: string) {
    if (keyword) {
      tabRef.current?.deselect()
    } else {
      tabRef.current?.select(store.selectedCategory)
    }
    store.search(keyword)
  }

  return (
    <div className={Style.container} onMouseDown={(e) => e.preventDefault()}>
      <div className={Style.tabContainer}>
        <LunaTab
          className={Style.tab}
          height={30}
          onSelect={(category) => store.selectCategory(category)}
          onCreate={(tab) => (tabRef.current = tab)}
        >
          {tabItems}
        </LunaTab>
        <div className={Style.search} onMouseDown={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={store.keyword}
            onChange={(e) => search(e.target.value)}
          />
          <div className="icon">
            {store.keyword ? (
              <span className="icon-delete" onClick={() => search('')} />
            ) : (
              <span className="icon-search" />
            )}
          </div>
        </div>
      </div>
      <div className={Style.tags}>{tags}</div>
    </div>
  )
})

const toggleTag = debounce((tag) => store.toggleTag(tag), 100)
