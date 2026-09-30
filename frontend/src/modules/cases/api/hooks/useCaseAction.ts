import { useMutation, useQueryClient } from '@tanstack/react-query'

import { ApiError } from '@/lib/api/httpClient'
import { revalidateSessionOnAccessError } from '@/modules/auth'
import { homeFeedQueryKey } from '@/modules/house/api/hooks/useHomeFeed'
import { patchCaseStatus, postCaseMessage, postCaseAction } from '../endpoints'
import type { CaseAction, CaseDetail, CaseEventsResponse } from '../endpoints'
import { caseDetailQueryKey } from './useCaseDetail'

export const useCaseAction = (houseId: string, userId: string, id: string) => {
  const client = useQueryClient()
  const detailKey = caseDetailQueryKey(houseId, userId, id)

  return useMutation<
    CaseDetail | CaseEventsResponse['events'][number],
    Error,
    CaseAction
  >({
    mutationFn: (action: CaseAction) => {
      switch (action.kind) {
        case 'workflow':
          return postCaseAction(id, action.body)
        case 'messages':
          return postCaseMessage(id, action.body)
        case 'status':
          return patchCaseStatus(id, action.body)
      }
    },
    onSuccess: async (result, action) => {
      await client.cancelQueries({ queryKey: detailKey })
      if ('current_step' in result) {
        client.setQueryData(detailKey, result)
      }
      const refresh = Promise.all([
        client.invalidateQueries({ queryKey: detailKey }),
        client.invalidateQueries({ queryKey: ['house', houseId, 'cases'] }),
        client.invalidateQueries({ queryKey: ['dispatch', userId] }),
        client.invalidateQueries({
          queryKey: homeFeedQueryKey(houseId, userId),
        }),
      ])
      if (action.kind === 'status') await refresh
    },
    onError: (error) => {
      revalidateSessionOnAccessError(error, client)
      if (error instanceof ApiError && [404, 409, 422].includes(error.status)) {
        client.invalidateQueries({ queryKey: detailKey })
      }
    },
  })
}
