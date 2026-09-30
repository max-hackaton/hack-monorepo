import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { revalidateSessionOnAccessError } from '@/modules/auth'
import { getHouses } from '../endpoints'

export const housesQueryKey = ['profile', 'houses'] as const

export const useHousesQuery = () => {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: housesQueryKey,
    queryFn: getHouses,
    retry: false,
  })

  useEffect(() => {
    revalidateSessionOnAccessError(query.error, queryClient)
  }, [query.error, queryClient])

  return query
}
