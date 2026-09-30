import { useMutation, useQueryClient } from '@tanstack/react-query'

import { ApiError } from '@/lib/api/httpClient'
import { revalidateSessionOnAccessError } from '@/modules/auth'
import { sessionQueryKey } from '@/modules/auth/api/hooks/useSessionQuery'
import type { GetSessionResponse } from '@/modules/auth/api/endpoints'
import { housesQueryKey } from './useHousesQuery'
import { selectHouse } from '../endpoints'

export const useSelectHouseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: selectHouse,
    onSuccess: async (session) => {
      await queryClient.cancelQueries({ queryKey: sessionQueryKey })
      const previousHouseId =
        queryClient.getQueryData<GetSessionResponse>(sessionQueryKey)?.house?.id
      if (previousHouseId && previousHouseId !== session.house?.id) {
        queryClient.removeQueries({ queryKey: ['house', previousHouseId] })
      }
      queryClient.removeQueries({ queryKey: ['house', 'home'] })
      queryClient.setQueryData(sessionQueryKey, session)
    },
    onError: (error) => {
      revalidateSessionOnAccessError(error, queryClient)
      if (error instanceof ApiError && error.status === 403) {
        queryClient.invalidateQueries({ queryKey: housesQueryKey })
      }
    },
  })
}
