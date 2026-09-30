import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'

export type DispatchHouseSelection =
  paths['/api/dispatch/house-selection']['get']['responses'][200]['content']['application/json']
export type UpdateDispatchHouseSelection = NonNullable<
  paths['/api/dispatch/house-selection']['put']['requestBody']
>['content']['application/json']

export const getDispatchHouseSelection = (signal?: AbortSignal) =>
  api.get<DispatchHouseSelection>('/api/dispatch/house-selection', { signal })

export const updateDispatchHouseSelection = (
  body: UpdateDispatchHouseSelection,
) => api.put<DispatchHouseSelection>('/api/dispatch/house-selection', body)
