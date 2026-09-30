import { useEffect } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'

import { revalidateSessionOnAccessError } from '@/modules/auth'
import { getCases } from '../endpoints'
import type { CasesScope, CasesStatus } from '../endpoints'

export const casesQueryKey = (
  houseId: string,
  userId: string,
  scope: CasesScope,
  status?: CasesStatus,
) => ['house', houseId, 'cases', scope, userId, status] as const

export const useCases = (
  houseId: string,
  userId: string,
  scope: CasesScope,
  status?: CasesStatus,
  enabled = true,
) => {
  const queryClient = useQueryClient()
  const query = useInfiniteQuery({
    queryKey: casesQueryKey(houseId, userId, scope, status),
    queryFn: ({ pageParam }) =>
      status ? getCases(scope, pageParam, status) : getCases(scope, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    retry: false,
    enabled,
  })
  useEffect(() => {
    revalidateSessionOnAccessError(query.error, queryClient)
  }, [query.error, queryClient])
  return query
}
