import { ApiError } from '@/lib/api/httpClient'
import type { GetSessionResponse } from '../api/endpoints'
import { useSessionQuery } from '../api/hooks/useSessionQuery'

export type AuthSessionState =
  | { status: 'loading' }
  | { status: 'openInMax' }
  | { status: 'error'; retry: () => void }
  | { status: 'authenticated'; session: GetSessionResponse }

export const useAuthSession = (
  afterLogout = false,
  enabled = true,
): AuthSessionState => {
  const sessionQuery = useSessionQuery(enabled, afterLogout)

  if (!enabled || sessionQuery.isPending || sessionQuery.isFetching)
    return { status: 'loading' }
  if (sessionQuery.isSuccess)
    return { status: 'authenticated', session: sessionQuery.data }
  if (
    sessionQuery.error instanceof ApiError &&
    sessionQuery.error.status === 401
  )
    return { status: 'openInMax' }

  return {
    status: 'error',
    retry: () => sessionQuery.refetch(),
  }
}
