import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'

export type SelectHouseRequest = NonNullable<
  paths['/api/auth/session/house']['put']['requestBody']
>['content']['application/json']

export type SelectHouseResponse =
  paths['/api/auth/session/house']['put']['responses'][200]['content']['application/json']

export const selectHouse = (body: SelectHouseRequest) =>
  api.put<SelectHouseResponse>('/api/auth/session/house', body)
