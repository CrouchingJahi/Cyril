// Displays all of the available transaction categories in a tree format, given the category array
// Creates a tree where the category id is the name and the value is an object of its children
export default function createCategoryTree (data) {
  let usedEntries = []

  return data.reduce((tree, category) => {
    if (usedEntries.includes(category)) return tree

    let treePointer = tree
    let catAncestry = category.catAncestry?.length > 0 ? category.catAncestry.split(',') : []
    // Add ancestor nodes from furthest ancestor down to current node
    for (let ancestorLevel = catAncestry.length; ancestorLevel > 0; ancestorLevel--) {
      let ancestorId = catAncestry[ancestorLevel - 1]
      if (!treePointer[ancestorId]) {
        let thisAncestor = data.find(entry => entry.id === ancestorId)
        treePointer[ancestorId] = {}
        usedEntries.push(thisAncestor)
      }
      treePointer = treePointer[ancestorId]
    }
    // Add current node
    treePointer[category.id] = {}
    usedEntries.push(category)

    return tree
  }, {})
}
