import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { revalidateSessionOnAccessError } from '@/modules/auth'
import { getCaseType } from '../endpoints'

export const useCaseType = (houseId: string, key: string | undefined) => {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['house', houseId, 'case-type', key],
    queryFn: () => getCaseType(key!),
    enabled: Boolean(key),
    retry: false,
  })
  useEffect(() => {
    revalidateSessionOnAccessError(query.error, queryClient)
  }, [query.error, queryClient])
  return query
}
