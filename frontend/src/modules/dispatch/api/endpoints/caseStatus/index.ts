import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'

export type DispatchStatusInput = NonNullable<
  paths['/api/dispatch/cases/{case_id}/status']['put']['requestBody']
>['content']['application/json']

export const updateDispatchStatus = (id: string, body: DispatchStatusInput) =>
  api.put(`/api/dispatch/cases/${encodeURIComponent(id)}/status`, body)
