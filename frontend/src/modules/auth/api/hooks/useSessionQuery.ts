import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'

import { ApiError } from '@/lib/api/httpClient'
import { getMaxBridge } from '@/lib/max/bridge'
import { getSession, postSession } from '../endpoints'

export const sessionQueryKey = ['auth', 'session'] as const

export const useSessionQuery = (enabled: boolean, afterLogout = false) => {
  const handledLaunch = useRef<string | undefined>(undefined)
  const login = async () => {
    const initData = getMaxBridge()?.initData ?? '__DEV_USER__'
    const session = await postSession({ init_data: initData })
    handledLaunch.current = initData
    return session
  }

  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: async () => {
      const launch = getMaxBridge()
      if (afterLogout || (launch && handledLaunch.current !== launch.initData))
        return login()
      try {
        return await getSession()
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return login()
        throw error
      }
    },
    enabled,
    retry: false,
    retryOnMount: false,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}
