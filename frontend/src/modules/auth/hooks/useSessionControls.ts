import { useContext } from 'react'

import { SessionControlsContext } from '../components/MaxSessionProvider'

export const useSessionControls = () => {
  const controls = useContext(SessionControlsContext)
  if (!controls)
    throw new Error('useSessionControls must be used inside MaxSessionProvider')
  return controls
}
