import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'

export type DispatchAssignmentInput = NonNullable<
  paths['/api/dispatch/cases/{case_id}/assignment']['put']['requestBody']
>['content']['application/json']

export const updateDispatchAssignment = (
  id: string,
  body: DispatchAssignmentInput,
) => api.put(`/api/dispatch/cases/${encodeURIComponent(id)}/assignment`, body)
