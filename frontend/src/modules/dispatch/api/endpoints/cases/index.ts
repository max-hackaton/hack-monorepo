import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'

export type DispatchCases =
  paths['/api/dispatch/cases']['get']['responses'][200]['content']['application/json']
type DispatchQuery = NonNullable<
  paths['/api/dispatch/cases']['get']['parameters']['query']
>
export type DispatchFilters = Omit<
  DispatchQuery,
  'house_ids[]' | 'status_keys[]'
> & {
  house_ids?: DispatchQuery['house_ids[]']
  status_keys?: DispatchQuery['status_keys[]']
}

export const getDispatchCases = (
  filters: DispatchFilters,
  signal?: AbortSignal,
) => {
  const { house_ids, status_keys, ...scalarFilters } = filters
  const query = new URLSearchParams()
  Object.entries<string | boolean | undefined>(scalarFilters).forEach(
    ([key, value]) => {
      if (value !== undefined) query.set(key, String(value))
    },
  )
  house_ids?.forEach((id) => query.append('house_ids[]', id))
  status_keys?.forEach((status) => query.append('status_keys[]', status))
  return api.get<DispatchCases>(`/api/dispatch/cases?${query}`, { signal })
}
