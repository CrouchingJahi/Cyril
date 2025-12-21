// Mock objects, to keep test files cleanish

// Transactions
export const trxBasic = [{
  id: 'foo',
  categoryId: 'foo',
  txnDate: '2020-02-20',
}]

export const trxSingleBill = [{
  id: 'justabill',
  categoryId: '14',
  txnAmount: '-123.45',
  txnDate: '2000-01-01',
  txnType: 'DEBIT',
}]

export const trxDeepCat = [{
  id: 'deep cat',
  categoryId: '5',
  txnAmount: '-505.05',
  txnDate: '1234-12-12',
  txnType: 'DEBIT',
}]

export const trxNarrowDateRange = [{
  id: 'earlier',
  categoryId: '0',
  txnAmount: '-10',
  txnDate: '2000-01-01',
  txnType: 'DEBIT',
}, {
  id: 'later',
  categoryId: '0',
  txnAmount: '-10',
  txnDate: '2000-01-02',
  txnType: 'DEBIT',
}]

export const trxMediumDateRange = [{
  id: 'earlier',
  categoryId: '0',
  txnAmount: '-10',
  txnDate: '2000-01-02',
  txnType: 'DEBIT',
}, {
  id: 'later',
  categoryId: '0',
  txnAmount: '-10',
  txnDate: '2000-02-01',
  txnType: 'DEBIT',
}]

export const trxWideDateRange = [{
  id: 'earlier',
  categoryId: '0',
  txnAmount: '-10',
  txnDate: '2000-01-01',
  txnType: 'DEBIT',
}, {
  id: 'later',
  categoryId: '0',
  txnAmount: '-10',
  txnDate: '2025-10-01',
  txnType: 'DEBIT',
}]

export const trxSameParentCategory = [{
  id: 'carryoutOrder',
  categoryId: '27',
  txnAmount: '-60',
  txnType: 'DEBIT',
}, {
  id: 'barhop1',
  categoryId: '28',
  txnAmount: '-21',
  txnType: 'DEBIT',
}, {
  id: 'barhop2',
  categoryId: '28',
  txnAmount: '-22',
  txnType: 'DEBIT',
}, {
  id: 'barhop3',
  categoryId: '28',
  txnAmount: '-23',
  txnType: 'DEBIT',
}, {
  id: 'barhop4',
  categoryId: '28',
  txnAmount: '-24',
  txnType: 'DEBIT',
}]


// Categories
export const catJustRoot = [{
  id: 'foo',
  catName: 'Unit Testing',
  catAncestry: ''
}]

export const catDeepHierarchy = [{
  id: '0',
  catName: 'Trunk',
  catAncestry: ''
}, {
  id: '1',
  catName: 'Still Trunk',
  catAncestry: '0'
}, {
  id: '2',
  catName: 'Tall Trunk',
  catAncestry: '1,0'
}, {
  id: '3',
  catName: 'Limb',
  catAncestry: '2,1,0'
}, {
  id: '4',
  catName: 'Branch',
  catAncestry: '3,2,1,0'
}, {
  id: '5',
  catName: 'Leaf',
  catAncestry: '4,3,2,1,0'
}]
