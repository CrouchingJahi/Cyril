import { useMemo, useState } from 'react'
import IconButton from '@/ui/IconButton'
import createCategoryTree from '~/utils/createCategoryTree'

import './categoryDisplay.scss'

/*
Show transaction categories in a way that makes the tree structure navigable
First, displays the root categories in a scrollable list
*/
export default function CategoryDisplay ({ categories }) {
  const categoryTree = useMemo(() => createCategoryTree(categories), [categories])
  const [currentCategoryLevel, setCurrentCategoryLevel] = useState(0)
  // Array where each slot is the selected node of that tree level
  const [selectedCategories, setSelectedCategories] = useState([])

  function selectCategory (catLevel, catId) {
    const newSelectedCategories = [...selectedCategories]
    newSelectedCategories.splice(catLevel, 1, catId)
    setSelectedCategories(newSelectedCategories)
    setCurrentCategoryLevel(catLevel)
  }

  function deselectCategory () {
    const newSelectedCategories = selectedCategories.slice(0, selectedCategories.length - 1)
    setSelectedCategories(newSelectedCategories)
    setCurrentCategoryLevel(currentCategoryLevel - 1)
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
    const catList = categories.filter(cat => catIds.includes(cat.id))

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
    const selectedNode = categories.find(cat => cat.id == selectionId)
    return <div className="category-level collapsed">
      { level === currentCategoryLevel - 1 ?
        <IconButton preset='lArrow' text={selectedNode.catName} fn={() => deselectCategory()} /> :
        <div className="grandparent">{ selectedNode.catName }</div>
      }
    </div>
  }
}
