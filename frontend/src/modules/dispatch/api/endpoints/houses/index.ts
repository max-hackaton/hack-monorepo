import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'

export type DispatchHouses =
  paths['/api/dispatch/houses']['get']['responses'][200]['content']['application/json']

export const getDispatchHouses = (afterId?: string, signal?: AbortSignal) =>
  api.get<DispatchHouses>('/api/dispatch/houses', {
    params: { after_id: afterId },
    signal,
  })
