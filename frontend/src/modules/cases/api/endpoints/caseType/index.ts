import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'

export type CaseType =
  paths['/api/case-types/{key}']['get']['responses'][200]['content']['application/json']
export type CaseTypeKey =
  paths['/api/case-types/{key}']['get']['parameters']['path']['key']

export const getCaseType = (key: CaseTypeKey) =>
  api.get<CaseType>(`/api/case-types/${encodeURIComponent(key)}`)
