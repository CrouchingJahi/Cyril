import { useMemo, useState } from 'react'
import IconButton from '@/ui/IconButton'
import createCategoryTree from '~/utils/createCategoryTree'

import './categoryDisplay.scss'

/**
 * Show transaction categories in a way that makes the tree structure navigable
 * Displays the root categories in a scrollable list. Categories with children are selectable.
 * When selecting a child, that category name will be on  allow the user to select one to see further into the tree.

 * @param categoryList Array of transaction category objects
 * @param selected (opt) The ID of the current selection
 * @param selectFn (opt) The function to set the state of the selected catgory 
 * 
 * If selected is undefined, it will just display the navigable category tree.
 */
export default function CategoryDisplay ({ categoryList, selected, selectFn }) {
  const categoryTree = useMemo(() => createCategoryTree(categoryList), [categoryList])
  const [currentCategoryLevel, setCurrentCategoryLevel] = useState(0)
  // Array where each slot is the selected node of that tree level
  const [selectedCategories, setSelectedCategories] = useState([])

  function selectCategory (catLevel, catId) {
    const newSelectedCategories = [...selectedCategories]
    newSelectedCategories.splice(catLevel, 1, catId)
    setSelectedCategories(newSelectedCategories)
    setCurrentCategoryLevel(catLevel)
  }

  // Remove selection of all category levels past catLevel
  function deselectCategory (catLevel = currentCategoryLevel) {
    const newSelectedCategories = selectedCategories.slice(0, catLevel + 1)
    setSelectedCategories(newSelectedCategories)
    setCurrentCategoryLevel(catLevel)
  }

  if (categoryTree) {
    return <div className="category-display">
      <CategoryTreeTier treeNode={categoryTree} level={0} />
    </div>
  } else {
    return <div>{ /* Loading animation */ }</div>
  }

  function CategoryTreeTier({treeNode, level}) {
    if (currentCategoryLevel > level) {
      const childNode = treeNode[selectedCategories[level]]
      return <>
        <ParentCategoryTier level={level} />
        <CategoryTreeTier treeNode={childNode} level={level + 1} />
      </>
    }

    const catIds = Object.keys(treeNode)
    const catList = categoryList.filter(cat => catIds.includes(cat.id))

    return <ul className="category-level">
      { catList.map(category => {
        const childTree = treeNode[category.id]
        const hasChildren = Object.keys(childTree).length > 0
        return <li key={category.id}>
          { category.catName }
          { hasChildren && <IconButton preset='rArrow' fn={() => selectCategory(level + 1, category.id)} /> }
        </li>
      }) }
    </ul>
  }

  function ParentCategoryTier ({level}) {
    const selectionId = selectedCategories[level]
    const selectedNode = categoryList.find(cat => cat.id == selectionId)
    return <div className="category-level collapsed">
      <IconButton preset='lArrow' text={selectedNode.catName} fn={() => deselectCategory(level)} />
    </div>
  }
}
