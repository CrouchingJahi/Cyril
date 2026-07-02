import { createContext, useState } from 'react'
import MessageCenter from '@/ui/MessageCenter'

const userSettings = await cyrilAPI.getUserSettings()
const MSG_TIMER = userSettings?.messageDuration || 5000

export const MessageContext = createContext({ messageQueue: []})

export default function MessageProvider ({ children }) {
  const [messageQueue, setMessageQueue] = useState([])

  function removeCurrentMessage () {
    setMessageQueue(messageQueue.slice(1))
  }

  function postMessage (newMsg) {
    setMessageQueue([...messageQueue, newMsg])
    setTimeout(removeCurrentMessage, MSG_TIMER)
  }

  const context = {
    messageQueue,
    postMessage,
  }

  return <MessageContext value={context}>
    <MessageCenter messageQueue={messageQueue} />
    { children }
  </MessageContext>
}
