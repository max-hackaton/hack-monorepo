import { useMutation, useQueryClient } from '@tanstack/react-query'

import { revalidateSessionOnAccessError } from '@/modules/auth'
import { homeFeedQueryKey } from '@/modules/house/api/hooks/useHomeFeed'
import { createCase } from '../endpoints'
import { caseDetailQueryKey } from './useCaseDetail'

export const useCreateCaseMutation = (
  houseId: string,
  userId: string,
  onCreated: (id: string) => void,
  onFailure: () => void,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCase,
    onSuccess: (created) => {
      onCreated(created.id)
      queryClient.setQueryData(
        caseDetailQueryKey(houseId, userId, created.id),
        created,
      )
      queryClient.invalidateQueries({
        queryKey: ['house', houseId, 'cases', 'mine'],
      })
      queryClient.invalidateQueries({
        queryKey: homeFeedQueryKey(houseId, userId),
      })
    },
    onError: (error) => {
      onFailure()
      revalidateSessionOnAccessError(error, queryClient)
    },
  })
}
