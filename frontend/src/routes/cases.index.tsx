import { Navigate, createFileRoute } from '@tanstack/react-router'

import {
  NoHouseAccessPage,
  useMaxSession,
  useSessionControls,
} from '@/modules/auth'
import { CasesPage } from '@/modules/cases'
import type { CasesScope } from '@/modules/cases/api/endpoints'

const CasesRoute = () => {
  const { house, id: userId } = useMaxSession()
  const { role } = useSessionControls()
  if (role === 'dispatcher') return <Navigate to="/" replace />
  return house ? (
    <CasesPage houseId={house.id} userId={userId} />
  ) : (
    <NoHouseAccessPage />
  )
}

export const Route = createFileRoute('/cases/')({
  validateSearch: (search): { scope?: CasesScope } => ({
    ...(search.scope === 'mine' || search.scope === 'subscriptions'
      ? { scope: search.scope }
      : {}),
  }),
  component: CasesRoute,
})
