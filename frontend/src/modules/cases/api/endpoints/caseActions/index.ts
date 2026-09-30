import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'

type ActionOperation = paths['/api/cases/{case_id}/actions']['post']
export type CaseWorkflowInput =
  ActionOperation['requestBody']['content']['application/json']
type ActionResponse =
  ActionOperation['responses'][200]['content']['application/json']

export const postCaseAction = (id: string, body: CaseWorkflowInput) =>
  api.post<ActionResponse>(`/api/cases/${encodeURIComponent(id)}/actions`, body)
