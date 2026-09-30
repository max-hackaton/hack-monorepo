import { useEffect } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'

import { revalidateSessionOnAccessError } from '@/modules/auth'
import { getCaseEvents } from '../endpoints'

export const caseEventsQueryKey = (
  houseId: string,
  userId: string,
  id: string,
) => ['house', houseId, 'case', userId, id, 'events'] as const

export const useCaseEvents = (
  houseId: string,
  userId: string,
  id: string,
  enabled: boolean,
) => {
  const queryClient = useQueryClient()
  const query = useInfiniteQuery({
    queryKey: caseEventsQueryKey(houseId, userId, id),
    queryFn: ({ pageParam }) => getCaseEvents(id, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled,
    refetchInterval: (activeQuery) =>
      activeQuery.state.status === 'error' ? false : 15_000,
    retry: false,
  })
  useEffect(() => {
    revalidateSessionOnAccessError(query.error, queryClient)
  }, [query.error, queryClient])
  return query
}
