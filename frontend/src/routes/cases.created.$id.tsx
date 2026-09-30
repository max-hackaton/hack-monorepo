import { Navigate, createFileRoute } from '@tanstack/react-router'

import {
  NoHouseAccessPage,
  useMaxSession,
  useSessionControls,
} from '@/modules/auth'
import { CreatedCasePage } from '@/modules/cases'

const CreatedCaseRoute = () => {
  const { house, id: userId } = useMaxSession()
  const { id } = Route.useParams()
  const { role } = useSessionControls()
  if (role === 'dispatcher')
    return <Navigate to="/cases/$id" params={{ id }} replace />
  return house ? (
    <CreatedCasePage houseId={house.id} userId={userId} id={id} />
  ) : (
    <NoHouseAccessPage />
  )
}

export const Route = createFileRoute('/cases/created/$id')({
  component: CreatedCaseRoute,
})
