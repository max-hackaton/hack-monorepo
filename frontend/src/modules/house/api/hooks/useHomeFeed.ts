import { useEffect } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'

import { revalidateSessionOnAccessError } from '@/modules/auth'
import { getHome } from '../endpoints'
import type { HomeSort } from '../endpoints'

export const homeFeedQueryKey = (houseId: string, userId: string) =>
  ['house', 'home', houseId, userId] as const

export const useHomeFeed = (
  houseId: string,
  userId: string,
  sort: HomeSort,
) => {
  const queryClient = useQueryClient()
  const home = useInfiniteQuery({
    queryKey: [...homeFeedQueryKey(houseId, userId), sort],
    queryFn: ({ pageParam }) => getHome({ sort, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    retry: false,
  })

  useEffect(() => {
    revalidateSessionOnAccessError(home.error, queryClient)
  }, [home.error, queryClient])

  return home
}
