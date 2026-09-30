import { createFileRoute } from '@tanstack/react-router'

import { HousePage } from '@/modules/house'
import {
  NoHouseAccessPage,
  useMaxSession,
  useSessionControls,
} from '@/modules/auth'
import { DispatchPage, validateDispatchSearch } from '@/modules/dispatch'
import type { DispatchSearch } from '@/modules/dispatch'
import type { HomeSort } from '@/modules/house'

const HomeRoute = () => {
  const { house, id: userId } = useMaxSession()
  const { role } = useSessionControls()
  if (role === 'dispatcher') return <DispatchPage />

  return house ? (
    <HousePage house={house} userId={userId} />
  ) : (
    <NoHouseAccessPage />
  )
}

export const Route = createFileRoute('/')({
  validateSearch: (search): { sort?: HomeSort } & DispatchSearch => ({
    ...(search.sort === 'confirmations' ? { sort: 'confirmations' } : {}),
    ...validateDispatchSearch(search),
  }),
  component: HomeRoute,
})
