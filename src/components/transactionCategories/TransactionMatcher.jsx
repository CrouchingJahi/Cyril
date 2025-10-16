
export default function TransactionMatcher({stringMatchers, categories, transactionName}) {
  const matches = stringMatchers.filter(regex => transactionName.matches(regex.pattern)).map(matcher => {
    return {
      ...matcher,
      category: categories.find(cat => cat.id == matcher.categoryId),
    }
  })
  return <div>
    { matches.length > 0 ?
      <div>
        { matches.length } { matches.length == 1 ? 'match' : 'matches' } found:
        <ul>
          { matches.map(matcher => <li>{ matcher.pattern } &rarr; { matcher.category.catName }</li>) }
        </ul>
      </div> :
      <div>No matches found.</div>
    }
  </div>
}
