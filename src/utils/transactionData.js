/**
 * Parses a list of transactions into a format ready for charts to use.
 * The transactions are expected to be filtered before passing to this function.
 * 
 * @param transactions array of transactions
 * @param categories array of categories
 * 
 * @returns {
 *  total: the total value of all transactions added up
 *  timeframe: {
 *    start: the date of the earliest transaction
 *    end: the date of the latest transaction
 *  }
 *  hierarchy: A tree format of categories for the d3 charts
 * }
 */
export function createTransactionData (transactions, categories) {
  // Collect all necessary stats in 1 loop through transactions
  return transactions.reduce((stats, txn) => {
    // Total
    // only pull debit transactions as spending? what to do w/ credit?
    let txnAmount = parseFloat(txn.txnAmount)
    if (!Number.isNaN(txnAmount)) {
      stats.total += Math.abs(txn.txnAmount)
    }

    // Timeframe
    if (!stats.timeframe.start || txn.txnDate < stats.timeframe.start) {
      stats.timeframe.start = txn.txnDate
    }
    if (!stats.timeframe.end || txn.txnDate > stats.timeframe.end) {
      stats.timeframe.end = txn.txnDate
    }

    // Category Hierarchy
    let thisCategory = categories.find(cat => cat.id == txn.categoryId)
    addAncestryToTree(stats.hierarchy, categories, thisCategory, txn)

    return stats
  }, {
    total: 0,
    timeframe: {},
    hierarchy: {
      name: "Total",
      children: [],
    },
  })
}

// Build a branch out of this node and its ancestors and add it to the tree
function addAncestryToTree(tree, categories, thisCategory, thisTxn) {
  let treePointer = tree
  // Add ancestors to tree
  if (thisCategory.catAncestry) {
    let ancestors = thisCategory.catAncestry.split(',')
    for (let b = ancestors.length - 1; b >= 0; b--) {
      let thisAncestor = categories.find(cat => cat.id == ancestors[b])
      // Check if this ancestor is already in the tree
      let branchMatch = treePointer.children.find(branch => branch.catId == thisAncestor.id)
      if (branchMatch) {
        treePointer = branchMatch
      } else {
        let newBranch = {
          name: thisAncestor.catName,
          catId: thisAncestor.id,
          children: []
        }
        treePointer.children.push(newBranch)
        // travel down tree for next loop
        treePointer = newBranch
      }
    }
  }
  // Then add this node
  treePointer.children.push({
    name: thisCategory.catName,
    catId: thisCategory.id,
    value: Math.abs(thisTxn.txnAmount),
  })
}
