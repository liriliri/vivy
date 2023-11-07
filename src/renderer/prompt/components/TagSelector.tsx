import { observer } from 'mobx-react-lite'
import Style from './TagSelector.module.scss'
import LunaTab, { LunaTabItem } from 'luna-tab/react'
import map from 'licia/map'
import { t } from '../../lib/util'
import className from 'licia/className'
import store from '../store'
import * as prompt from '../../lib/prompt'

export default observer(function TagSelector() {
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

  const tags = map(store.selectedCategoryTags, (tags, subCategory) => {
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
              onClick={() => store.toggleTag(tag)}
              title={translation ? tag : ''}
            >
              {translation || tag}
            </span>
          )
        })}
      </div>
    )
  })

  return (
    <div className={Style.container}>
      <LunaTab
        className={Style.tab}
        height={30}
        onSelect={(category) => store.selectCategory(category)}
      >
        {tabItems}
      </LunaTab>
      <div className={Style.tags}>{tags}</div>
    </div>
  )
})
