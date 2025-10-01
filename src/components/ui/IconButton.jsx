import './iconButton.scss'

const buttonPresets = {
  close: '&#10006;',
  back: '&#x25c4;',
  lArrow: '&#8701;',
  rArrow: '&#8702;',
  edit: '&#9998;',
}

function decodeHtml (text) {
  var decoder = document.createElement('textarea')
  decoder.innerHTML = text
  return decoder.value
}

export default function IconButton ({ text, preset, label, className, disabled, fn }) {
  const buttonClasses = ['icon-button']
  const buttonContent = preset && decodeHtml(buttonPresets[preset])
  if (typeof buttonContent == 'string') {
    buttonClasses.push('text')
  }
  if (typeof className == 'string' && className.length > 0) {
    buttonClasses.push(className)
  }

  return <button className={buttonClasses.join(' ')} label={label} disabled={disabled} onClick={fn} type="button">
    { buttonContent }
    { text }
  </button>
}
