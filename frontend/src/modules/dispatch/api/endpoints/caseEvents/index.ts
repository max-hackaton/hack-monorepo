import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'

export type DispatchEvents =
  paths['/api/dispatch/cases/{case_id}/events']['get']['responses'][200]['content']['application/json']

export const getDispatchEvents = (
  id: string,
  cursor?: string,
  signal?: AbortSignal,
) =>
  api.get<DispatchEvents>(
    `/api/dispatch/cases/${encodeURIComponent(id)}/events`,
    { params: { cursor }, signal },
  )
