import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'

export type DispatchDetail =
  paths['/api/dispatch/cases/{id}']['get']['responses'][200]['content']['application/json']

export const getDispatchCase = (id: string, signal?: AbortSignal) =>
  api.get<DispatchDetail>(`/api/dispatch/cases/${encodeURIComponent(id)}`, {
    signal,
  })
