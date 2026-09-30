import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'

export type CaseId = paths['/api/cases/{id}']['get']['parameters']['path']['id']
export type CaseDetail =
  paths['/api/cases/{id}']['get']['responses'][200]['content']['application/json']

export const getCase = (id: CaseId) =>
  api.get<CaseDetail>(`/api/cases/${encodeURIComponent(id)}`)
