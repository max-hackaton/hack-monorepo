import { useQuery } from '@tanstack/react-query'
import { useMaxSession } from '@/modules/auth'
import { getDispatchCase } from '../endpoints'
import { useAccessError } from './useAccessError'

export const useDispatchCase = (caseId: string) => {
  const { id } = useMaxSession()
  const query = useQuery({
    queryKey: ['dispatch', id, 'case', caseId],
    queryFn: ({ signal }) => getDispatchCase(caseId, signal),
    refetchInterval: (activeQuery) =>
      activeQuery.state.status === 'error' ? false : 15_000,
    retry: false,
  })
  useAccessError(query.error)
  return query
}
