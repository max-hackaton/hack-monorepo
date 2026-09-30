import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'

export type CaseEventsResponse =
  paths['/api/cases/{case_id}/events']['get']['responses'][200]['content']['application/json']

export const getCaseEvents = (id: string, cursor?: string) =>
  api.get<CaseEventsResponse>(`/api/cases/${encodeURIComponent(id)}/events`, {
    params: cursor ? { cursor } : undefined,
  })
