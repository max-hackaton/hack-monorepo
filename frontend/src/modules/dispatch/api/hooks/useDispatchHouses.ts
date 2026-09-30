import { useInfiniteQuery } from '@tanstack/react-query'
import { useMaxSession } from '@/modules/auth'
import { getDispatchHouses } from '../endpoints'
import { useAccessError } from './useAccessError'

export const useDispatchHouses = (enabled = true) => {
  const { id } = useMaxSession()
  const query = useInfiniteQuery({
    queryKey: ['dispatch', id, 'houses'],
    queryFn: ({ pageParam, signal }) => getDispatchHouses(pageParam, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.next_after_id ?? undefined,
    enabled,
    retry: false,
  })
  useAccessError(query.error)
  return query
}
