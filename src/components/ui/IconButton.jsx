import './iconButton.scss'

const buttonPresets = {
  close: '&#10006;',
  back: '&#x25c4;',
  lArrow: '&larr;',
  rArrow: '&rarr;',
}

function decodeHtml (text) {
  var decoder = document.createElement('textarea')
  decoder.innerHTML = text
  return decoder.value
}

export default function IconButton ({ text, preset, label, fn }) {
  const buttonClasses = ['icon-button']
  const buttonContent = preset && decodeHtml(buttonPresets[preset])
  if (typeof buttonContent == 'string') {
    buttonClasses.push('text')
  }

  return <button className={buttonClasses.join(' ')} label={label} onClick={fn}>
    { buttonContent }
    { text }
  </button>
}
