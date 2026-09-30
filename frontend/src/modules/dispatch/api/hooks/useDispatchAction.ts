import { useMutation, useQueryClient } from '@tanstack/react-query'
import { revalidateSessionOnAccessError, useMaxSession } from '@/modules/auth'
import { ApiError } from '@/lib/api/httpClient'
import {
  postDispatchMessage,
  postDispatchAction,
  updateDispatchAssignment,
  updateDispatchClassification,
  updateDispatchStatus,
} from '../endpoints'
import type { DispatchAction, DispatchDetail } from '../endpoints'

export const useDispatchAction = (caseId: string) => {
  const { id } = useMaxSession()
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (action: DispatchAction) => {
      switch (action.kind) {
        case 'workflow':
          return postDispatchAction(caseId, action.body)
        case 'classification':
          return updateDispatchClassification(caseId, action.body)
        case 'assignment':
          await updateDispatchAssignment(caseId, action.body)
          return
        case 'status':
          await updateDispatchStatus(caseId, action.body)
          return
        case 'messages':
          await postDispatchMessage(caseId, action.body)
          return
      }
    },
    onSuccess: async (result, action) => {
      if (result) {
        const detailKey = ['dispatch', id, 'case', caseId]
        await client.cancelQueries({ queryKey: detailKey })
        client.setQueryData<DispatchDetail>(detailKey, (current) =>
          current
            ? {
                ...current,
                case: result,
                next_action: {
                  label: 'Обновляем следующий шаг',
                  enabled: false,
                  can_change_classification: false,
                  can_change_contractor: false,
                },
              }
            : current,
        )
      }
      const refresh = Promise.all([
        client.invalidateQueries({ queryKey: ['dispatch', id] }),
        client.invalidateQueries({ queryKey: ['house'] }),
      ])
      if (action.kind !== 'messages') await refresh
    },
    onError: (error) => {
      revalidateSessionOnAccessError(error, client)
      if (error instanceof ApiError && [404, 409, 422].includes(error.status))
        client.invalidateQueries({
          queryKey: ['dispatch', id, 'case', caseId],
        })
    },
  })
}
