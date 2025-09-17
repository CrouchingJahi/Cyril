import { useMemo, useState } from 'react'
import createCategoryTree from '~/utils/createCategoryTree'

export default function CategoryDisplay ({ categories }) {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const categoryTree = useMemo(() => createCategoryTree(categories), [categories])
  const topLevelCategories = Object.keys(categoryTree)

  return <div className="category-display">
    <ul className="category-level">
      { topLevelCategories.map(categoryId => {
        const thisCategory = categories.find(cat => cat.id == categoryId)
        return <li key={categoryId}>{ thisCategory.catName }</li>
      })}
    </ul>
  </div>
}
