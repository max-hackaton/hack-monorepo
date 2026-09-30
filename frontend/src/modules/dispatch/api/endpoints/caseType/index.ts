import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'

export type DispatchType =
  paths['/api/dispatch/case-types/{key}']['get']['responses'][200]['content']['application/json']

export const getDispatchType = (key: string) =>
  api.get<DispatchType>(`/api/dispatch/case-types/${encodeURIComponent(key)}`)
