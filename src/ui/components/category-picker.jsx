import React from 'react'

export class CategoryPicker extends React.Component {
  render () {
    return (
      <form>
        <input type="text" list="category" />
        <datalist id="category">
          {
            <option value={} />
          }
        </datalist>
      </form>
    )
  }
}
