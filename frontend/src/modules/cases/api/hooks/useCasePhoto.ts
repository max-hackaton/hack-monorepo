import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { revalidateSessionOnAccessError, useMaxSession } from '@/modules/auth'
import { getCasePhoto } from '../endpoints'

export const useCasePhoto = (url: string) => {
  const { id } = useMaxSession()
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['case-photo', id, url],
    queryFn: ({ signal }) => getCasePhoto(url, signal),
    staleTime: 60_000,
    retry: false,
  })

  useEffect(() => {
    revalidateSessionOnAccessError(query.error, queryClient)
  }, [query.error, queryClient])

  return query
}
