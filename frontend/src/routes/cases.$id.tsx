import { createFileRoute } from '@tanstack/react-router'

import {
  NoHouseAccessPage,
  useMaxSession,
  useSessionControls,
} from '@/modules/auth'
import { DispatchCasePage, validateDispatchSearch } from '@/modules/dispatch'
import { CaseDetailPage } from '@/modules/cases'

const CaseRoute = () => {
  const { house, id: userId } = useMaxSession()
  const { id } = Route.useParams()
  const { role } = useSessionControls()
  if (role === 'dispatcher') return <DispatchCasePage id={id} />
  return house ? (
    <CaseDetailPage houseId={house.id} userId={userId} id={id} />
  ) : (
    <NoHouseAccessPage />
  )
}

export const Route = createFileRoute('/cases/$id')({
  component: CaseRoute,
  validateSearch: validateDispatchSearch,
})
