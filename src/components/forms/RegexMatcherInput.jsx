import { useContext, useState } from 'react'
import { VaultContext } from '@/context/VaultContext'

/**
 * An input to enter a regular expression to match against the category name
 * This is for automatic matching in future transaction uploads
 * 
 * @todo highlight the part of catName that matches
 */
export default function RegexMatcherInput ({ txnName = '', prefill }) {
  const { stringMatchers } = useContext(VaultContext)
  const [matcher, setMatcher] = useState(prefill || '')
  const matcherAlreadySaved = stringMatchers.some(sm => sm.pattern === matcher)
  const isMatching = (() => {
    // since this reevaluates at each key press, need to catch errors for invalid regex
    try {
      return matcher && !!txnName.match(matcher)
    } catch (e) {
      return false
    }
  })()

  function handleMatcherChange(e) {
    setMatcher(e.target.value)
  }

  return <fieldset className="category-matcher">
    <label htmlFor="regexMatch">Create Regex Matcher:</label>
    <div>
      <span className={ isMatching ? 'text-accent' : '' }>{ txnName }</span>
      { !matcherAlreadySaved && <span> (Will create new matcher)</span> }
    </div>
    <div className="flex align-center gap-s">
      <input name="regexMatch" value={matcher} onChange={handleMatcherChange} />
      { isMatching && <span className="text-accent"><b>&#10003;</b></span> }
    </div>
  </fieldset>
}
