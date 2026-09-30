import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'

type Operation = paths['/api/cases/{case_id}/action-form']['get']
export type CaseActionForm =
  Operation['responses'][200]['content']['application/json']

export const getCaseActionForm = (
  id: string,
  action: Operation['parameters']['query']['action'],
  expectedCurrentStepKey: string,
  expectedWorkflowVersion: number,
) =>
  api.get<CaseActionForm>(`/api/cases/${encodeURIComponent(id)}/action-form`, {
    params: {
      action,
      expected_current_step_key: expectedCurrentStepKey,
      expected_workflow_version: expectedWorkflowVersion,
    },
  })
