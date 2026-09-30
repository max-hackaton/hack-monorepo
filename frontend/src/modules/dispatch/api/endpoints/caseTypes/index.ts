import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'

export type DispatchTypes =
  paths['/api/dispatch/case-types']['get']['responses'][200]['content']['application/json']

export const getDispatchTypes = () =>
  api.get<DispatchTypes>('/api/dispatch/case-types')
