import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'

export type GetDispatchAccessResponse =
  paths['/api/dispatch/companies']['get']['responses'][200]['content']['application/json']

export const getDispatchAccess = () =>
  api.get<GetDispatchAccessResponse>('/api/dispatch/companies')
