import { useMutation, useQueryClient } from '@tanstack/react-query'

import { patchSession } from '../endpoints'
import type { PatchSessionRequest } from '../endpoints'
import { sessionQueryKey } from './useSessionQuery'

export const useSelectRoleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: PatchSessionRequest) => patchSession(body),
    onSuccess: async (session) => {
      await queryClient.cancelQueries({ queryKey: sessionQueryKey })
      queryClient.setQueryData(sessionQueryKey, session)
    },
  })
}
