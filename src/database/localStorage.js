const StorageKeys = {
  // Stores transactions after they're uploaded so that they can be categorized later
  pendingTransactions: 'pendingTrx'
}

export function getPendingTransactions () {
  const storedString = localStorage.getItem(StorageKeys.pendingTransactions)
  return JSON.parse(storedString)
}

export function savePendingTransactions (transactions) {
  const storedTransactions = getPendingTransactions()
  if (storedTransactions) {
    // append
  }
  localStorage.setItem(StorageKeys.pendingTransactions, JSON.stringify(transactions))
}

export function deletePendingTransactions () {
  localStorage.removeItem(StorageKeys.pendingTransactions)
}
