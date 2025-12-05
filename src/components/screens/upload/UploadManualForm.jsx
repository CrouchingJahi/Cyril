import { useState } from 'react'
import TransactionMatcher from '@/transactionCategories/TransactionMatcher'

const matcherOptions = {
  manualMatch: 'useManualMatcher',
  autoMatch: 'useAutoMatcher',
}

export default function UploadManualForm ({ userAccounts, setUserAccounts, categories, stringMatchers, setFormPhase }) {
  const defaultMatcherOption = stringMatchers.length > 0 ? matcherOptions.autoMatch : matcherOptions.manualMatch
  const [txnName, setTxnName] = useState('')
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [selectedRegexMatcher, setSelectedRegexMatcher] = useState(defaultMatcherOption)
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const selectedCategory = selectedCategoryId ? categories.find(cat => cat.id == selectedCategoryId) : null
  
  function submitManual (event) {
    event.preventDefault()
    let formData = Object.fromEntries(new FormData(event.target))
    let txn = {
      ...formData,
      categoryId: selectedCategoryId,
    }

    db.addTransaction(txn).then(() => {
      setFormPhase(formPhases.success)
    })
  }

  function handleMatcherChecked (event) {
    setSelectedRegexMatcher(event.target.value)
  }

  return <form onSubmit={submitManual}>
    <div className="grid cols-2">
      <AccountSelector name="accountId" accounts={userAccounts} setAccounts={setUserAccounts} selectedAccountId={selectedAccountId} setSelectedAccountId={setSelectedAccountId} />
      <fieldset>
        <label>Date:</label>
        <input name="txnDate" type="date" />
      </fieldset>
      <fieldset>
        <label>FITID:</label>
        <input name="id" type="text" />
      </fieldset>
      <fieldset>
        <label>Amount:</label>
        <input name="txnAmount" type="number" step="0.01" />
      </fieldset>
      <fieldset>
        <label>Memo:</label>
        <input name="txnMemo" type="text" />
      </fieldset>
      <fieldset>
        <label>Transaction Type:</label>
        <input name="txnType" type="text" />
      </fieldset>
      <fieldset>
        <label>Transaction Name:</label>
        <input name="txnName" type="text" value={txnName} onChange={e => setTxnName(e.target.value)} />
      </fieldset>
      <fieldset>
        <MatcherRadioOption optionName={matcherOptions.autoMatch}>
          Automatically Match Name To Category?
        </MatcherRadioOption>
        <MatcherRadioOption optionName={matcherOptions.manualMatch}>
          Enter New Matcher?
        </MatcherRadioOption>
      </fieldset>
      <fieldset>
        <label><h4>Category: { selectedCategory ? selectedCategory.catName : '(None Selected)' }</h4></label>
        <CategoryDisplay categoryList={categories} activeCatId={selectedCategoryId} setActiveFn={setSelectedCategoryId} />
      </fieldset>
      { selectedRegexMatcher == matcherOptions.autoMatch && <fieldset>
        <TransactionMatcher stringMatchers={stringMatchers} categories={categories} transactionName={txnName} />
      </fieldset> }
      { selectedRegexMatcher == matcherOptions.manualMatch && <RegexMatcherInput txnName={txnName} />}
    </div>
    <button>Add Transaction</button>
  </form>

  function MatcherRadioOption ({ optionName, children }) {
    return <div>
      <input type="radio" id={`regexMatcher-${optionName}`}
        name="regexMatcher" value={optionName}
        checked={selectedRegexMatcher == optionName}
        onChange={handleMatcherChecked}
      />
      <label htmlFor={`regexMatcher-${optionName}`}>{ children }</label>
    </div>
  }
}
