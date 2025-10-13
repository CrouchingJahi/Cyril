import { useRef, useImperativeHandle } from 'react'
import { createPortal } from 'react-dom'

/**
 * 
 * @param modalRef A ref used to control this element
 * @param modalId The ID of the dialog element
 * @param closeFn A function to perform any cleanup that needs done when the modal closes
 * @param className Classes to attach to the dialog class name
 */
export default function Modal ({ modalRef, modalId, closeFn, className, children }) {
  useImperativeHandle(modalRef, () => {
    return {
      open: () => dialogRef.current.showModal(),
      close: () => dialogRef.current.close(),
    }
  })
  const dialogRef = useRef(null)
  const dialogProps = {}
  if (closeFn) dialogProps.onClose = closeFn
  if (className) dialogProps.className = className

  return createPortal(<dialog id={modalId} ref={dialogRef} {...dialogProps}>
    { children }
  </dialog>, document.getElementById("modals"))
}
