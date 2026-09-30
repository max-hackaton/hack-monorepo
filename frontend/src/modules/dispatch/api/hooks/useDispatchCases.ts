import { useInfiniteQuery } from '@tanstack/react-query'
import { useMaxSession } from '@/modules/auth'
import { getDispatchCases } from '../endpoints'
import type { DispatchFilters } from '../endpoints'
import { useAccessError } from './useAccessError'

export const useDispatchCases = (filters: DispatchFilters, enabled = true) => {
  const { id } = useMaxSession()
  const query = useInfiniteQuery({
    queryKey: ['dispatch', id, 'cases', filters],
    queryFn: ({ pageParam, signal }) =>
      getDispatchCases({ ...filters, cursor: pageParam }, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.next_cursor ?? undefined,
    enabled: enabled && Boolean(filters.house_ids?.length),
    retry: false,
  })
  useAccessError(query.error)
  return query
}
