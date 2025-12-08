import { useEffect, useState } from 'react'
import { modifyCategory, addCategory, addStringMatcher } from '~/database/db'
import CategoryDisplay from '@/transactionCategories/CategoryDisplay'

// Category picker, then the options that depend on having an active category
export default function CategoryOptions ({categories, setCategories, stringMatchers, setStringMatchers}) {
  const [activeCategoryId, setActiveCategoryId] = useState(null)

  return <>
    <section>
      <h2>Transaction Categories</h2>
      { categories.length == 0 ? <p>No categories exist yet.</p> :
        <>
          <CategoryDisplay categoryList={categories} activeCatId={activeCategoryId} setActiveFn={setActiveCategoryId} />
          <h4>Selected Category: { activeCategoryId ? categories.find(cat => cat.id == activeCategoryId).catName : '(None Selected)' }</h4>
        </>
      }
    </section>
    <AddCategoryForm />
    <ModifyCategoryForm />
    <CategoryMatcherOptions />
  </>

  function buildAncestryString (parentId) {
    if (!parentId) return ''
    let ancestorCategory = categories.find(cat => cat.id == parentId)
    if (ancestorCategory.catAncestry.length > 0) {
      return `${parentId},${ancestorCategory.catAncestry}`
    } else {
      return parentId
    }
  }
  // if isModifying, do not allow setting catParent to own category
  function CategoryParentSelector ({elementId, selectedParentId, setSelectedParentId, isModifying}) {
    return <select name="catParent" id={elementId}
      value={selectedParentId}
      onChange={(e) => setSelectedParentId(e.target.value)}
    >
      <option value="">(None)</option>
      { categories.map(category => <option key={category.id} value={category.id} disabled={isModifying && category.id == activeCategoryId}>{ category.catName }</option>)}
    </select>
  }

  function ModifyCategoryForm () {
    if (!activeCategoryId) {
      return <section />
    }
    const selectedCategory = categories.find(cat => cat.id == activeCategoryId)
    const [selectedParentId, setSelectedParentId] = useState(selectedCategory.catAncestry.split(',').shift())

    function handleModifyCategory (event) {
      event.preventDefault()
      const formData = Object.fromEntries(new FormData(event.target))
      modifyCategory({
        id: activeCategoryId,
        ...formData,
        catAncestry: buildAncestryString(selectedParentId)
      }).then(res => {
        let newCategories = [...categories]
        newCategories[categories.indexOf(cat => cat.id == activeCategoryId)] = res
        setCategories(newCategories)
      })
    }

    return <section>
      <form onSubmit={handleModifyCategory}>
        <fieldset>
          <label>Category Name</label>
          <input name="catName" defaultValue={selectedCategory.catName} />
        </fieldset>
        <fieldset>
          <label htmlFor="modifyCategoryParent">Category Parent</label>
          <CategoryParentSelector elementId="modifyCategoryParent" selectedParentId={selectedParentId} setSelectedParentId={setSelectedParentId} isModifying={true} />
        </fieldset>
        <button>Modify Category</button>
      </form>
    </section>
  }

  function AddCategoryForm () {
    const [selectedParentId, setSelectedParentId] = useState('')
    useEffect(() => {
      if (activeCategoryId) {
        setSelectedParentId(activeCategoryId)
      }
    }, [activeCategoryId])

    function handleAddCategory (event) {
      event.preventDefault()
      const formData = Object.fromEntries(new FormData(event.target))
      addCategory({
        ...formData,
        catAncestry: buildAncestryString(selectedParentId)
      }).then(res => {
        setCategories([...categories, res])
      })
      event.target.reset()
    }

    return <section>
      <form id="add-category" onSubmit={handleAddCategory}>
        <p>&nbsp;</p>
        <h3>Add Category</h3>
        <fieldset>
          <label htmlFor="catName">Name</label>
          <input name="catName" required />
        </fieldset>
        <fieldset>
          <label htmlFor="newCategoryParent">Parent Category</label>
          <CategoryParentSelector elementId="newCategoryParent" selectedParentId={selectedParentId} setSelectedParentId={setSelectedParentId} />
        </fieldset>
        <button>Add Category</button>
      </form>
    </section>
  }

  function CategoryMatcherOptions () {
    function handleAddMatcher (e) {
      const formData = Object.fromEntries(new FormData(event.target))
      e.preventDefault()

      addStringMatcher({
        ...formData,
        categoryId: activeCategoryId
      }).then(res => {
        setStringMatchers([...stringMatchers, res])
      })
      e.target.reset()
    }
    return <section>
      <h3>Transaction Category Matchers</h3>
      { stringMatchers.length == 0 ? <p>No category matchers have been created yet.</p> :
        <ul>
          { stringMatchers.map(matcher => <li key={matcher.id}>
            { matcher.pattern } &#8702; { categories.find(cat => cat.id == matcher.categoryId).catName }
          </li>)}
          {/* Delete button */}
        </ul>
      }
      <form id="add-category-matcher" onSubmit={handleAddMatcher}>
        <fieldset>
          <label>Regex pattern to match:</label>
          <input name="pattern" />
        </fieldset>
        <button disabled={!activeCategoryId}>Create Matcher</button>
      </form>
    </section>
  }
}
