const storageKeys = {
  // Stores transactions after they're uploaded so that they can be categorized later
  pendingTransactions: 'pendingTrx'
}

export function getPendingTransactions () {
  const storedString = localStorage.getItem(storageKeys.pendingTransactions)
  return JSON.parse(storedString)
}

export function savePendingTransactions (transactions) {
  const storedTransactions = getPendingTransactions()
  if (storedTransactions) {
    // append
  }
  localStorage.setItem(storageKeys.pendingTransactions, JSON.stringify(transactions))
}
