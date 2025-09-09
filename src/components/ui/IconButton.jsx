import './iconButton.scss'

const buttonPresets = {
  close: '&#10006;',
}

function decodeHtml (text) {
  var decoder = document.createElement('textarea')
  decoder.innerHTML = text
  return decoder.value
}

export default function IconButton ({ text, preset, label, fn }) {
  const buttonClasses = ['icon-button']
  const buttonContent = text || (preset && decodeHtml(buttonPresets[preset]))
  if (typeof buttonContent == 'string') {
    buttonClasses.push('text')
  }

  return <button className={buttonClasses.join(' ')} label={label} onClick={fn}>
    { buttonContent }
  </button>
}
