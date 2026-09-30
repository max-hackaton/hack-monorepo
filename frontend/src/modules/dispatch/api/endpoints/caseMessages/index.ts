import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'

export type DispatchMessageInput = NonNullable<
  paths['/api/dispatch/cases/{case_id}/messages']['post']['requestBody']
>['content']['application/json']

export const postDispatchMessage = (id: string, body: DispatchMessageInput) =>
  api.post(`/api/dispatch/cases/${encodeURIComponent(id)}/messages`, body)
