import { useInfiniteQuery } from '@tanstack/react-query'
import { useMaxSession } from '@/modules/auth'
import { getDispatchEvents } from '../endpoints'
import { useAccessError } from './useAccessError'

export const useDispatchEvents = (caseId: string, enabled: boolean) => {
  const { id } = useMaxSession()
  const query = useInfiniteQuery({
    queryKey: ['dispatch', id, 'case', caseId, 'events'],
    queryFn: ({ pageParam, signal }) =>
      getDispatchEvents(caseId, pageParam, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.next_cursor ?? undefined,
    enabled,
    refetchInterval: (activeQuery) =>
      activeQuery.state.status === 'error' ? false : 15_000,
    retry: false,
  })
  useAccessError(query.error)
  return query
}
