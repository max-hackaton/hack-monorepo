import { useSessionControls } from '@/modules/auth'
import { DispatcherProfile } from './DispatcherProfile'
import { ResidentProfile } from './ResidentProfile'

export const ProfilePage = () => {
  const { role } = useSessionControls()
  return role === 'dispatcher' ? <DispatcherProfile /> : <ResidentProfile />
}
