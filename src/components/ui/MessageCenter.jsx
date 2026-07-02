// import { useContext } from 'react'
// import MessageContext from '@/context/MessageContext'

import './messageCenter.scss'

export function Message ({ msg }) {
  // const { removeCurrentMessage } = useContext(MessageContext)
  return <div className="message">
    {/* TODO Close button */}
    { msg }
  </div>
}

export default function MessageCenter ({messageQueue}) {
  return (
    <div className={`message-center ${messageQueue.length == 0 ? 'empty' : ''}`}>
      { messageQueue.length > 0 && <Message msg={ messageQueue[0] } /> }
    </div>
  )
}
