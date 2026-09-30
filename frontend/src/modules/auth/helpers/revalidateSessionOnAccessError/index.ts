import type { QueryClient } from '@tanstack/react-query'

import { ApiError } from '@/lib/api/httpClient'
import { sessionQueryKey } from '../../api/hooks/useSessionQuery'

export function revalidateSessionOnAccessError(
  error: unknown,
  queryClient: QueryClient,
) {
  if (
    error instanceof ApiError &&
    (error.status === 401 || error.status === 403)
  ) {
    queryClient.invalidateQueries({ queryKey: sessionQueryKey })
  }
}
