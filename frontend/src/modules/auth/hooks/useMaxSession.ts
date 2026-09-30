import { useContext } from 'react'
import { MaxContext } from '../components/MaxSessionProvider'

export const useMaxSession = () => {
  const session = useContext(MaxContext)

  if (session === undefined) {
    throw new Error('useMaxSession must be used inside MaxSessionProvider')
  }

  return session
}
