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

  // Remove selection of all category levels past and including catLevel
  function deselectCategory (catLevel = currentCategoryLevel) {
    const newSelectedCategories = selectedCategories.slice(0, catLevel)
    setSelectedCategories(newSelectedCategories)
    setCurrentCategoryLevel(catLevel)
  }

  function selectNode (catId) {
    if (selectFn) {
      selectFn(catId)
    }
  }

  if (categoryTree) {
    return <div className="category-display">
      <CategoryTree treeNode={categoryTree} level={0} />
    </div>
  } else {
    return <div>{ /* Loading animation */ }</div>
  }

  function CategoryTree ({treeNode, level}) {
    if (currentCategoryLevel > level) {
      const childNode = treeNode[selectedCategories[level]]
      return <>
        <ParentCategoryTier level={level} />
        <CategoryTree treeNode={childNode} level={level + 1} />
      </>
    }

    const catIds = Object.keys(treeNode)
    const catList = categoryList.filter(cat => catIds.includes(cat.id))

    // need a UX for distinguishing between selecting the category and viewing child categories
    return <>
      { level > 0 && <ChildBranchLines nodes={catList.length} /> }
      <div className="category-level current">
        { catList.map(category => {
          const childTree = treeNode[category.id]
          const hasChildren = Object.keys(childTree).length > 0
          return <div className={`category-choice ${selected == category.id ? 'selected' : ''}`} key={category.id}>
            <button className="unstyled category-name" onClick={() => selectNode(category.id)}>
              <span>{ category.catName }</span>
            </button>
            { hasChildren && <IconButton preset='rArrow' className="child-link" fn={() => selectCategory(level + 1, category.id)} /> }
          </div>
        }) }
      </div>
    </>
  }

  function ChildBranchLines ({nodes}) {
    return <div className="tree-branch-lines">
      { nodes == 1 && <div>&#9472;&#9655;&nbsp;</div> }
      { nodes > 1 && Array.from({length: nodes}).map((_, ind) => {
        return ind == 0 ? <div key={ind}>&#9516;&#9655;&nbsp;</div>
          : ind == nodes - 1 ? <div key={ind}>&#9492;&#9655;&nbsp;</div>
          : <div key={ind}>&#9500;&#9655;&nbsp;</div>
      }) }
    </div>
  }

  /**
   * @todo show lines branching from parent to current category entries
   */
  function ParentCategoryTier ({level}) {
    const selectionId = selectedCategories[level]
    const selectedNode = categoryList.find(cat => cat.id == selectionId)
    return <div className="category-level parent">
      <button className="unstyled" onClick={() => deselectCategory(level)}>
        { level == 0 ? <span>&#128923;&nbsp;</span> : <span>&#9472;&nbsp;</span> }
        <span className={selected == selectedNode.id ? 'selected' : ''}>{ selectedNode.catName }</span>
        <span>&nbsp;&#9472;</span>
      </button>
    </div>
  }
}
