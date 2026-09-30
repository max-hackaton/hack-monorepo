import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'

type ActionOperation = paths['/api/dispatch/cases/{case_id}/actions']['post']
export type DispatchWorkflowInput =
  ActionOperation['requestBody']['content']['application/json']
type ActionResponse =
  ActionOperation['responses'][200]['content']['application/json']

export const postDispatchAction = (id: string, body: DispatchWorkflowInput) =>
  api.post<ActionResponse>(
    `/api/dispatch/cases/${encodeURIComponent(id)}/actions`,
    body,
  )
