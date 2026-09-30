import { useMutation, useQueryClient } from '@tanstack/react-query'

import { revalidateSessionOnAccessError } from '@/modules/auth'
import { homeFeedQueryKey } from '@/modules/house/api/hooks/useHomeFeed'
import { postConfirmCase } from '../endpoints'
import { caseDetailQueryKey } from './useCaseDetail'

export const useConfirmCaseMutation = (houseId: string, userId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postConfirmCase,
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({
        queryKey: caseDetailQueryKey(houseId, userId, id),
      })
      queryClient.invalidateQueries({
        queryKey: ['house', houseId, 'cases', 'subscriptions', userId],
      })
      queryClient.invalidateQueries({
        queryKey: homeFeedQueryKey(houseId, userId),
      })
    },
    onError: (error) => revalidateSessionOnAccessError(error, queryClient),
  })
}
