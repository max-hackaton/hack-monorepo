import { Navigate, createFileRoute } from '@tanstack/react-router'

import {
  NoHouseAccessPage,
  useMaxSession,
  useSessionControls,
} from '@/modules/auth'
import { CreateCasePage } from '@/modules/cases'

const NewCaseRoute = () => {
  const { house, id: userId } = useMaxSession()
  const { role } = useSessionControls()
  if (role === 'dispatcher') return <Navigate to="/" replace />
  return house ? (
    <CreateCasePage
      key={`${house.id}:${userId}`}
      houseId={house.id}
      userId={userId}
    />
  ) : (
    <NoHouseAccessPage />
  )
}

export const Route = createFileRoute('/cases/new')({ component: NewCaseRoute })
