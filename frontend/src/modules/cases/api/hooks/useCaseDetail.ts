import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { revalidateSessionOnAccessError } from '@/modules/auth'
import { getCase } from '../endpoints'

export const caseDetailQueryKey = (
  houseId: string,
  userId: string,
  id: string,
) => ['house', houseId, 'case', userId, id] as const

export const useCaseDetail = (houseId: string, userId: string, id: string) => {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: caseDetailQueryKey(houseId, userId, id),
    queryFn: () => getCase(id),
    refetchInterval: (activeQuery) =>
      activeQuery.state.status === 'error' ? false : 15_000,
    retry: false,
  })
  useEffect(() => {
    revalidateSessionOnAccessError(query.error, queryClient)
  }, [query.error, queryClient])
  return query
}
