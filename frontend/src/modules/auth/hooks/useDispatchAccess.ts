import { useQuery } from '@tanstack/react-query'

import { getDispatchAccess } from '../api/endpoints'
import type { AuthSessionState } from './useAuthSession'

export const useDispatchAccess = (state: AuthSessionState, enabled: boolean) =>
  useQuery({
    queryKey: [
      'auth',
      'dispatch-access',
      state.status === 'authenticated' ? state.session.id : null,
    ],
    queryFn: getDispatchAccess,
    enabled: enabled && state.status === 'authenticated',
    retry: false,
  })
