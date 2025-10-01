import { useState } from 'react'
/**
 * An input to enter a regular expression to match against the category name
 * This is for automatic matching in future transaction uploads
 * 
 * @todo highlight the part of catName that matches
 */
export default function CategoryMatcher ({ txnName = '' }) {
  const [matcher, setMatcher] = useState('')
  const isMatching = (() => {
    // since this reevaluates at each key press, need to catch errors for invalid regex
    try {
      return matcher && !!txnName.match(matcher)
    } catch (e) {
      return false;
    }
  })()

  function handleMatcherChange(e) {
    setMatcher(e.target.value)
  }

  return <div className="category-matcher">
    <label htmlFor="regexMatch">Create Regex Matcher</label>
    <div className={ isMatching ? 'text-accent' : '' }>{ txnName }</div>
    <div className="flex align-center gap-s">
      <input name="regexMatch" value={matcher} onChange={handleMatcherChange} />
      { isMatching && <span className="text-accent"><b>&#10003;</b></span> }
    </div>
  </div>
}
