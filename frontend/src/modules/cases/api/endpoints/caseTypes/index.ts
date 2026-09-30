import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'

export type CaseTypesResponse =
  paths['/api/case-types']['get']['responses'][200]['content']['application/json']

export const getCaseTypes = () => api.get<CaseTypesResponse>('/api/case-types')
