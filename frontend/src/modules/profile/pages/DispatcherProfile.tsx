import { AppHeader } from '@/components/AppHeader'
import { AppPageContainer } from '@/components/AppPageContainer'
import { LogoutButton } from '@/modules/auth'
import { ProfileIdentity } from '../components/ProfileIdentity'

export const DispatcherProfile = () => (
  <AppPageContainer>
    <AppHeader title="Профиль" />
    <ProfileIdentity role="dispatcher" />
    <LogoutButton />
  </AppPageContainer>
)
