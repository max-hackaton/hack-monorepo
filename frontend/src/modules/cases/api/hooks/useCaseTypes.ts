import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { revalidateSessionOnAccessError } from '@/modules/auth'
import { getCaseTypes } from '../endpoints'

export const useCaseTypes = (houseId: string) => {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['house', houseId, 'case-types'],
    queryFn: getCaseTypes,
    retry: false,
  })
  useEffect(() => {
    revalidateSessionOnAccessError(query.error, queryClient)
  }, [query.error, queryClient])
  return query
}
